package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"encoding/json"
	"fmt"
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
func (h *UserHandler) CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateUser(&user); err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}
	fmt.Printf("%+v\n", user)

	// Respond with the created user details (excluding password)
	utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    user,
	})
}
