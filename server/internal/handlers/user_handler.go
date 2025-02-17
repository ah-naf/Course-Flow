package handlers

import (
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"net/http"
)

// UserHandler handles HTTP requests related to users.
type UserHandler struct {
	Service *services.UserService
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{Service: service}
}

// GetUserHandler handle GET /api/users requests to get all the user.
func (h *UserHandler) GetUserHandler(w http.ResponseWriter, r *http.Request) error {
	users, err := h.Service.GetAllUser()
	if err != nil {
		return nil
	}
	return utils.WriteJSON(w, http.StatusOK, users)
}
