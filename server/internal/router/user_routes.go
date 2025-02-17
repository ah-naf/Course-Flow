package router

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupUserRouter(router *mux.Router) {
	// Initialize user-related components
	userStorage := storage.NewUserStorage(r.DB)
	userService := services.NewUserService(userStorage)
	userHandler := handlers.NewUserHandler(userService)

	// User routes
	router.HandleFunc("/api/users", middleware.ConvertToHandlerFunc(userHandler.GetUserHandler)).Methods("GET")
}
