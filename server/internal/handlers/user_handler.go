package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"encoding/json"
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

// CreateUserHandler handles POST /api/users requests to create a new user.
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) error {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		return err
	}

	if err := h.Service.CreateUser(&user); err != nil {
		return err
	}

	// Respond with the created user details (excluding password)
	return utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    user,
	})
}
