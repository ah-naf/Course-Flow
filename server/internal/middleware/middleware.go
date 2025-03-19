package middleware

import (
	"course-flow/internal/utils"
	"net/http"
)

type apiFunc = func(http.ResponseWriter, *http.Request) error

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
		// defer func() {
		// 	if r := recover(); r != nil {
		// 		log.Printf("Panice: %v\n", r)
		// 		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Internal server error"})
		// 	}
		// }()
		if err := f(w, r); err != nil {
			code, message := mapErrorToStatus(err)
			utils.WriteJSON(w, code, map[string]string{"error": message})
		}
	}
}
