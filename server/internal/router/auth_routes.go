package router

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupAuthRoutes(router *mux.Router) {
	// Initialize auth-related components
	userStorage := storage.NewUserStorage(r.DB)
	authStorage := storage.NewAuthStorage(r.DB)
	authService := services.NewAuthService(userStorage, authStorage)
	authHandler := handlers.NewAuthHandler(authService)

	// Auth routes
	router.HandleFunc("/api/auth/register", middleware.ConvertToHandlerFunc(authHandler.RegisterHandler)).Methods("POST")
	router.HandleFunc("/api/auth/login", middleware.ConvertToHandlerFunc(authHandler.LoginHandler)).Methods("POST")
	router.HandleFunc("/api/auth/logout", middleware.ConvertToHandlerFunc(authHandler.Logout)).Methods("POST")
}
