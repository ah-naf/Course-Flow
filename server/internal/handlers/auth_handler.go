package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"encoding/json"
	"net/http"
)

type AuthHandler struct {
	Service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{Service: service}
}

// Handles POST /api/auth/login resquests to login user
func (h *AuthHandler) LoginHandler(w http.ResponseWriter, r *http.Request) error {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	tokens, err := h.Service.Login(&req)
	if err != nil {
		return err
	}
	return utils.WriteJSON(w, http.StatusOK, tokens)
}

// Handles POST /api/auth/register requests to register a new user.
func (h *AuthHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) error {
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
