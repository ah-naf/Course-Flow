package websocket

import (
	"course-flow/internal/types"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Client represents a connected user
type Client struct {
	conn     *websocket.Conn
	userID   string
	classIDs map[string]bool // Classes the user belongs to
}

// Hub manages all WebSocket clients
type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	notify     chan types.Notification
	mu         sync.Mutex
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		notify:     make(chan types.Notification, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.conn.Close()
			}
			h.mu.Unlock()

		case notif := <-h.notify:
			h.mu.Lock()
			// fmt.Println("notif", notif)
			for client := range h.clients {
				// Check if the client is in the class and is a recipient
				if contains(notif.RecipientIDs, client.userID) {
					data, err := notif.ToJSON()
					if err != nil {
						log.Println("Failed to marshal notification:", err)
						continue
					}

					err = client.conn.WriteMessage(websocket.TextMessage, data)
					if err != nil {
						go func(c *Client) { h.unregister <- c }(client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) Handler(userID string, classIDs map[string]bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade error:", err)
			return
		}

		client := &Client{
			conn:     conn,
			userID:   userID,
			classIDs: classIDs,
		}
		h.register <- client

		defer func() {
			h.unregister <- client
		}()

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				return
			}

		}
	}
}

func (h *Hub) Notify(notif types.Notification) {
	h.notify <- notif
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
