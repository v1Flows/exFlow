package executions

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/JustLABv1/justflow/apps/backend/functions/encryption"
	"github.com/JustLABv1/justflow/apps/backend/functions/httperror"
	"github.com/JustLABv1/justflow/apps/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func CreateStep(ginCtx *gin.Context, db *bun.DB) {
	var step models.ExecutionSteps
	if err := ginCtx.ShouldBindJSON(&step); err != nil {
		httperror.StatusBadRequest(ginCtx, "Error parsing incoming data", err)
		return
	}

	ctx := context.Background()
	var stepID uuid.UUID

	err := db.RunInTx(ctx, &sql.TxOptions{}, func(ctx context.Context, tx bun.Tx) error {
		// get parent execution data
		var execution models.Executions
		if err := tx.NewSelect().Model(&execution).Column("flow_id").Where("id = ?", step.ExecutionID).Scan(ctx); err != nil {
			return err
		}
		// get flow data
		var flow models.Flows
		if err := tx.NewSelect().Model(&flow).Where("id = ?", execution.FlowID).Scan(ctx); err != nil {
			return err
		}
		// get project data
		var project models.Projects
		if err := tx.NewSelect().Model(&project).Where("id = ?", flow.ProjectID).Scan(ctx); err != nil {
			return err
		}

		// check for encryption
		if project.EncryptionEnabled && len(step.Messages) > 0 {
			var encErr error
			step.Messages, encErr = encryption.EncryptExecutionStepActionMessageWithProject(step.Messages, project.ID.String(), db)
			if encErr != nil {
				return encErr
			}
			step.Encrypted = true
		}

		step.ID = uuid.New()
		step.CreatedAt = time.Now()
		stepID = step.ID

		_, err := tx.NewInsert().Model(&step).Exec(ctx)
		return err
	})

	if err != nil {
		httperror.InternalServerError(ginCtx, "Error creating execution step", err)
		log.Error("Error creating execution step", err)
		return
	}

	ginCtx.JSON(http.StatusCreated, gin.H{"result": "success", "id": stepID})
}
