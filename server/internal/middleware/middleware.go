package middleware

import (
	"course-flow/internal/utils"
	"fmt"
	"log"
	"net/http"
)

type apiFunc = func(http.ResponseWriter, *http.Request) error

func CORSMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			allowed := false

			for _, o := range allowedOrigins {
				if o == "*" || o == origin {
					allowed = true
					break
				}
			}

			if allowed {
				// Set CORS headers
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func AuthMiddleware(next apiFunc) apiFunc {
	return func(w http.ResponseWriter, r *http.Request) error {
		userID, err := utils.ExtractUserIDFromToken(r)
		if err != nil {
			return err
		}

		// Attach user ID to request context for further processing
		ctx := r.Context()
		ctx = utils.SetUserIDInContext(ctx, userID)
		r = r.WithContext(ctx)

		return next(w, r)
	}
}

func ConvertToHandlerFunc(f apiFunc, middlewares ...func(apiFunc) apiFunc) http.HandlerFunc {
	// Apply middleware functions in sequence
	for _, middleware := range middlewares {
		f = middleware(f)
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// fmt.Println("url", r.URL)
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panice: %v\n", r)
				utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
			}
		}()
		if err := f(w, r); err != nil {
			fmt.Println("err", err)
			code, message := mapErrorToStatus(err)
			utils.WriteJSON(w, code, map[string]string{"error": message})
		}
	}
}
