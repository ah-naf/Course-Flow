package middleware

import (
	"collab-editor/internal/utils"
	"net/http"
)

// Maps an error to an appropriate HTTP status code and message
func mapErrorToStatus(err error) (int, string) {
	if apiErr, ok := err.(*utils.ApiError); ok {
		switch apiErr.Code {
		case "USER_NOT_FOUND":
			return http.StatusNotFound, apiErr.Message
		case "EMAIL_DUPLICATE", "USERNAME_DUPLICATE":
			return http.StatusConflict, apiErr.Message
		case "VALIDATION_ERROR":
			return http.StatusBadRequest, apiErr.Message
		case "ACCESS_DENIED", "INVALID_REFRESH_TOKEN", "TOKEN_EXPIRED", "INVALID_TOKEN":
			return http.StatusUnauthorized, apiErr.Message
		case "TOKEN_STORAGE_FAILED":
			return http.StatusInternalServerError, "Failed to store token"
		case "TOKEN_NOT_FOUND", "USER_TOKENS_NOT_FOUND":
			return http.StatusNotFound, apiErr.Message
		default:
			return http.StatusInternalServerError, "Internal server error"
		}
	}

	// Ensure non-ApiError errors don’t expose internal details
	return http.StatusInternalServerError, "An unexpected error occurred"
}
