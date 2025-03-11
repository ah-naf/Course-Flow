package router

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupAuthRouter(router *mux.Router) {
	// Initialize auth-related components
	userStorage := storage.NewUserStorage(r.DB)
	authStorage := storage.NewAuthStorage(r.DB)
	authService := services.NewAuthService(userStorage, authStorage)
	authHandler := handlers.NewAuthHandler(authService)

	authRouter := router.PathPrefix("/auth").Subrouter()

	// Auth routes
	authRouter.HandleFunc("/register", middleware.ConvertToHandlerFunc(authHandler.RegisterHandler)).Methods("POST")
	authRouter.HandleFunc("/login", middleware.ConvertToHandlerFunc(authHandler.LoginHandler)).Methods("POST")
	authRouter.HandleFunc("/refresh", middleware.ConvertToHandlerFunc(authHandler.RefreshTokenHandler)).Methods("POST")
	authRouter.HandleFunc("/logout", middleware.ConvertToHandlerFunc(authHandler.Logout, middleware.AuthMiddleware)).Methods("POST")

	// Google OAuth
	authRouter.HandleFunc("/google/login", middleware.ConvertToHandlerFunc(authHandler.HandleGoogleLogin)).Methods("GET")
	authRouter.HandleFunc("/google/callback", middleware.ConvertToHandlerFunc(authHandler.HandleGoogleCallback)).Methods("GET")

	// Github OAuth
	authRouter.HandleFunc("/github/login", middleware.ConvertToHandlerFunc(authHandler.HandleGitHubLogin)).Methods("GET")
	authRouter.HandleFunc("/github/callback", middleware.ConvertToHandlerFunc(authHandler.HandleGitHubCallback)).Methods("GET")

}
