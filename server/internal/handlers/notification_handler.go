package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"net/http"
)

type NotificationHandler struct {
	service *services.NotificationService
}

func NewNotificationHandler(service *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{service: service}
}

func (h *NotificationHandler) GetAllNotificationForUserHandler(w http.ResponseWriter, r *http.Request) error {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		return err
	}

	notif, err := h.service.GetUserNotifications(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, notif)
}
