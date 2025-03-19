package projects

import (
	"github.com/v1Flows/exFlow/services/backend/functions/gatekeeper"
	"github.com/v1Flows/exFlow/services/backend/functions/httperror"
	project_function "github.com/v1Flows/exFlow/services/backend/functions/project"
	functions "github.com/v1Flows/exFlow/services/backend/functions/user"
	"github.com/v1Flows/exFlow/services/backend/pkg/models"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	log "github.com/sirupsen/logrus"
	"github.com/uptrace/bun"
)

func AddProjectMember(context *gin.Context, db *bun.DB) {
	projectID := context.Param("projectID")

	// check if user has access to project
	access, err := gatekeeper.CheckUserProjectAccess(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for project access", err)
		return
	}
	if !access {
		httperror.Unauthorized(context, "You do not have access to this project", errors.New("you do not have access to this project"))
		return
	}

	// check the requestors role in project
	canModify, err := gatekeeper.CheckRequestUserProjectModifyRole(projectID, context, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking your user permissions on project", err)
		return
	}
	if !canModify {
		httperror.Unauthorized(context, "You are not allowed to make modifications on this project", errors.New("unauthorized"))
		return
	}

	type AddMember struct {
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	var incomingMember AddMember
	if err := context.ShouldBindJSON(&incomingMember); err != nil {
		httperror.StatusBadRequest(context, "Error parsing incoming data", err)
		return
	}

	// check if user exists
	var user models.Users
	userCount, err := db.NewSelect().Model(&user).Where("email = ?", incomingMember.Email).ScanAndCount(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving data from db", err)
		return
	}
	if userCount == 0 {
		httperror.StatusNotFound(context, "Error user not found", err)
		return
	}

	// check if user is already member
	isMember, err := project_function.CheckIfUserIsProjectMember(incomingMember.Email, projectID, db)
	if err != nil {
		httperror.InternalServerError(context, "Error checking for user membership in project", err)
		return
	}
	if isMember {
		httperror.StatusConflict(context, "User is already member of project", errors.New("user is already a member"))
		return
	}

	member := &models.ProjectMembers{
		UserID:        user.ID.String(),
		ProjectID:     projectID,
		Role:          incomingMember.Role,
		InvitePending: true,
	}
	_, err = db.NewInsert().
		Model(member).
		Column("user_id", "project_id", "role", "invite_pending").
		Exec(context)
	if err != nil {
		httperror.InternalServerError(context, "Error adding member to project on db", err)
		return
	}

	// get project data
	var project models.Projects
	err = db.NewSelect().Model(&project).Where("id = ?", projectID).Scan(context)
	if err != nil {
		httperror.InternalServerError(context, "Error receiving project data from db", err)
		return
	}

	// Notification
	err = functions.SendUserNotification(member.UserID, "Project Invitation", "You have been invited to join the project "+project.Name, "solar:file-right-broken", "primary", "/dashboard/projects", "To Projects", db)
	if err != nil {
		httperror.InternalServerError(context, "Error sending notification to new member", err)
		return
	}

	// Audit
	err = project_function.CreateAuditEntry(projectID, "info", "User invited to project: "+user.Username, db, context)
	if err != nil {
		log.Error(err)
	}

	context.JSON(http.StatusCreated, gin.H{"result": "success"})
}
