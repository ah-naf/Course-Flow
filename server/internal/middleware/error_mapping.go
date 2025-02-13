package middleware

import (
	"collab-editor/internal/utils"
	"net/http"
)

func mapErrorToStatus(err error) (int, string) {
	if apiErr, ok := err.(*utils.ApiError); ok {
		switch apiErr.Code {
		case "USER_NOT_FOUND":
			return http.StatusNotFound, apiErr.Message
		case "EMAIL_DUPLICATE", "USERNAME_DUPLICATE":
			return http.StatusConflict, apiErr.Message
		case "VALIDATION_ERROR":
			return http.StatusBadRequest, apiErr.Message
		default:
			return http.StatusInternalServerError, "Internal server error"
		}
	}
	return http.StatusInternalServerError, err.Error()
}
