package executions

import (
	"net/http"
	"time"

	log "github.com/sirupsen/logrus"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"

	"github.com/gin-gonic/gin"
	"github.com/uptrace/bun"
)

func Cancel(context *gin.Context, db *bun.DB) {
	executionID := context.Param("executionID")

	// get the runner_id from the execution
	var execution models.Executions
	err := db.NewSelect().Model(&execution).Where("id = ?", executionID).Scan(context)
	if err != nil {
		log.Error(err)
		httperror.InternalServerError(context, "Error getting execution from db", err)
		return
	}

	if execution.RunnerID == "" {
		execution.Status = "canceled"
		execution.FinishedAt = time.Now()

		_, err := db.NewUpdate().Model(&execution).Where("id = ?", executionID).Set("status = ?", execution.Status).Set("finished_at = ?", execution.FinishedAt).Exec(context)
		if err != nil {
			log.Error(err)
			httperror.InternalServerError(context, "Error updating execution on db", err)
			return
		}
	} else {
		// get the runner api_url
		var runner models.Runners
		err = db.NewSelect().Model(&runner).Where("id = ?", execution.RunnerID).Scan(context)
		if err != nil {
			log.Error(err)
			httperror.InternalServerError(context, "Error getting runner from db", err)
			return
		}

		if runner.ApiURL == "" {
			httperror.InternalServerError(context, "Runner api_url is empty", nil)
			return
		}

		// send a cancel request to the runner
		client := http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				DisableKeepAlives: true,
			},
		}
		req, err := http.NewRequest("POST", runner.ApiURL+"/executions/"+executionID+"/cancel", nil)
		if err != nil {
			log.Error(err)
			httperror.InternalServerError(context, "Error creating cancel request", err)
			return
		}
		req.Header.Set("Authorization", runner.ApiToken)
		resp, err := client.Do(req)
		if err != nil {
			log.Error(err)
			httperror.InternalServerError(context, "Error sending cancel request to runner", err)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			log.Error(err)
			httperror.InternalServerError(context, "Error canceling execution on runner", nil)
			return
		}
	}

	context.JSON(http.StatusOK, gin.H{"result": "success"})
}
