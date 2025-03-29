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

func (h *NotificationHandler) MarkNotificationAsReadHandler(w http.ResponseWriter, r *http.Request) error {
	notificationID := r.URL.Query().Get("id")
	if notificationID == "" {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Notification ID is required",
		}
	}

	err := h.service.MarkNotificationAsRead(notificationID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Notification marked as read"})
}

func (h *NotificationHandler) MarkAllNotificationsAsReadHandler(w http.ResponseWriter, r *http.Request) error {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		return err
	}

	err = h.service.MarkAllNotificationsAsRead(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "All notifications marked as read"})
}

func (h *NotificationHandler) ClearAllNotificationsHandler(w http.ResponseWriter, r *http.Request) error {
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		return err
	}

	err = h.service.ClearAllNotifications(userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "All notifications cleared"})
}