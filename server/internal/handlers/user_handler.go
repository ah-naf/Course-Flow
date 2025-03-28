package handlers

import (
	"course-flow/internal/types"
	"course-flow/internal/services"
	"course-flow/internal/utils"
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

func (h *UserHandler) GetUserWithIDHandler(w http.ResponseWriter, r *http.Request) error {
	user, err := h.Service.GetUserWithID(r)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) EditUserDetailsHadnler(w http.ResponseWriter, r *http.Request) error {
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		return &utils.ApiError{
			Code:    http.StatusBadRequest,
			Message: "Failed to parse form data: " + err.Error(),
		}
	}

	var user types.User
	user.FirstName = r.FormValue("first_name")
	user.LastName = r.FormValue("last_name")

	if err := h.Service.EditUserDetails(&user, r); err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, user)
}

// GetUserHandler handle GET /api/users requests to get all the user.
func (h *UserHandler) GetUserHandler(w http.ResponseWriter, r *http.Request) error {
	users, err := h.Service.GetAllUser()
	if err != nil {
		return nil
	}
	return utils.WriteJSON(w, http.StatusOK, users)
}
