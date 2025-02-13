package middleware

import (
	"collab-editor/internal/utils"
	"net/http"
)

type apiFunc = func(http.ResponseWriter, *http.Request) error

func ConvertToHandlerFunc(f apiFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := f(w, r); err != nil {
			code, message := mapErrorToStatus(err)
			utils.WriteJSON(w, code, map[string]string{"error": message})
		}
	}
}
