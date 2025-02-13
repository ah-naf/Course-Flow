package middleware

import (
	"collab-editor/internal/utils"
	"log"
	"net/http"
)

type apiFunc = func(http.ResponseWriter, *http.Request) error

func ConvertToHandlerFunc(f apiFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panice: %v\n", r)
				utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
			}
		}()
		if err := f(w, r); err != nil {
			code, message := mapErrorToStatus(err)
			utils.WriteJSON(w, code, map[string]string{"error": message})
		}
	}
}
