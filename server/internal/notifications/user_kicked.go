package notifications

import (
	"course-flow/internal/services"
	"course-flow/internal/types"
	"course-flow/internal/websocket"
	"database/sql"
)

type UserKickedNotifier struct {
	hub     *websocket.Hub
	service *services.NotificationService
}

func NewUserKickedNotifier(hub *websocket.Hub, db *sql.DB) *UserKickedNotifier {
	return &UserKickedNotifier{
		hub:     hub,
		service: services.NewNotificationService(db),
	}
}

func (n *UserKickedNotifier) Notify(classID, creatorID, toKick string) error {
	notifications, err := n.service.UserKickedNotification(types.NotifKickedResponse{
		ClassID: classID,
		AdminID: creatorID,
		UserID:  toKick,
	})
	if err != nil {
		return err
	}

	for _, notif := range notifications {
		n.hub.Notify(notif)
	}

	return nil
}
