package middleware

import (
	"course-flow/internal/utils"
	"net/http"
)

// Maps an error to an appropriate HTTP status code and message
func mapErrorToStatus(err error) (int, string) {
	if apiErr, ok := err.(*utils.ApiError); ok {
		return apiErr.Code, apiErr.Message
	}

	// Ensure non-ApiError errors don’t expose internal details
	return http.StatusInternalServerError, err.Error()
}
