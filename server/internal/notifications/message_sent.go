package notifications

import (
	"course-flow/internal/services"
	"course-flow/internal/types"
	"course-flow/internal/websocket"
	"database/sql"
	"fmt"
)

type MessageSentNotifier struct {
	hub     *websocket.Hub
	service *services.NotificationService
}

func NewMessageSentNotifier(hub *websocket.Hub, db *sql.DB) *MessageSentNotifier {
	return &MessageSentNotifier{
		hub:     hub,
		service: services.NewNotificationService(db),
	}
}

func (n *MessageSentNotifier) Notify(payload types.NotifMessageSentResponse) error {
	notifications, err := n.service.CreateMessageSentNotification(payload)
	if err != nil {
		return err
	}

	for _, notif := range notifications {
		n.hub.Notify(notif)
		fmt.Printf("not -> %+v\n", notif)
	}

	return nil
}
