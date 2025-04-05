package notifications

import (
	"course-flow/internal/services"
	"course-flow/internal/websocket"
	"database/sql"
)

type RoleChangedNotifier struct {
	hub     *websocket.Hub
	service *services.NotificationService
}

func NewRoleChangedNotifier(hub *websocket.Hub, db *sql.DB) *RoleChangedNotifier {
	return &RoleChangedNotifier{
		hub:     hub,
		service: services.NewNotificationService(db),
	}
}

func (n *RoleChangedNotifier) Notify(classID, userID string, role int) error {
	notifications, err := n.service.ChangeRoleNotification(classID, userID, role)
	if err != nil {
		return err
	}

	// Send real-time notifications via WebSocket
	for _, notif := range notifications {
		n.hub.Notify(notif)
	}

	return nil
}
