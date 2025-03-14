package projects

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"time"

	"github.com/v1Flows/exFlow/services/backend/functions/auth"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	functions_runner "github.com/v1Flows/exFlow/services/backend/functions/runner"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func GenerateProjectRunnerJoinSecretKey() (string, error) {
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		return "", err
	}
	return hex.EncodeToString(key), nil
}

func CreateProject(context *gin.Context, db *bun.DB) {
	userID, err := auth.GetUserIDFromToken(context.GetHeader("Authorization"))
	if err != nil {
		httperror.InternalServerError(context, "Error receiving userID from token", err)
		return
	}

	var project models.Projects
	if err := context.ShouldBindJSON(&project); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	if project.Name == "" {
		httperror.StatusBadRequest(context, "Project name is required", errors.New("project name is required"))
		return
	} else if project.Description == "" {
		httperror.StatusBadRequest(context, "Project description is required", errors.New("project description is required"))
		return
	}

	project.ID = uuid.New()

	project.RunnerAutoJoinToken, err = functions_runner.GenerateProjectAutoJoinToken(project.ID.String(), db)
	if err != nil {
		return
	}

	_, err = db.NewInsert().Model(&project).Column("id", "name", "description", "exflow_runners", "icon", "color", "runner_auto_join_token").Exec(context)
	if err != nil {
		log.Error(err)
		httperror.InternalServerError(context, "Error creating project on db", err)
		return
	}

	projectMember := models.ProjectMembers{
		UserID:         userID.String(),
		ProjectID:      project.ID.String(),
		Role:           "Owner",
		Disabled:       false,
		DisabledReason: "",
		InvitePending:  false,
		InvitedAt:      time.Now(),
	}
	_, err = db.NewInsert().Model(&projectMember).Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error adding member to project on db", err)
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
