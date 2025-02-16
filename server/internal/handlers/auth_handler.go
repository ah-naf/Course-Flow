package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"encoding/json"
	"net/http"
)

type AuthHandler struct {
	Service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{Service: service}
}

func (h *AuthHandler) LogUserIn(w http.ResponseWriter, r *http.Request) error {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	_, _, err := h.Service.Login(&req)
	if err != nil {
		return err
	}
	return nil
}
