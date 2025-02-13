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

// CreateUserHandler handles POST /api/users/register requests to create a new user.
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) error {
	var userReq models.UserRequest
	if err := json.NewDecoder(r.Body).Decode(&userReq); err != nil {
		return err
	}

	// convert userReq to model.User
	if err := h.Service.CreateUser(&userReq); err != nil {
		return err
	}

	// Respond with the created user details (excluding password)
	return utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    userReq,
	})
}

// GetUserHandler handle GET /api/users requests to get all the user.
func (h *UserHandler) GetUserHandler(w http.ResponseWriter, r *http.Request) error {
	users, err := h.Service.GetAllUser()
	if err != nil {
		return nil
	}
	return utils.WriteJSON(w, http.StatusOK, users)
}
