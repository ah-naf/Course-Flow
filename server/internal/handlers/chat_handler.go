package handlers

import (
	"course-flow/internal/services"
	"course-flow/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

type ChatHandler struct {
	service *services.ChatService
}

func NewChatHandler(service *services.ChatService) *ChatHandler {
	return &ChatHandler{
		service: service,
	}
}

func (h *ChatHandler) GetMessageHandler(w http.ResponseWriter, r *http.Request) error {
	courseID := mux.Vars(r)["course_id"]
	userID, err := utils.GetUserIDFromContext(r.Context())
	if err != nil {
		return err
	}

	messages, err := h.service.GetMessagesByCourse(courseID, userID)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, messages)
}
