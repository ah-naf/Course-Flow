package server

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"
	"database/sql"

	"github.com/gorilla/mux"
)

func SetupRouter(db *sql.DB) *mux.Router {
	router := mux.NewRouter()

	// Initialize layers: storage -> service -> handler
	userStorage := storage.NewUserStorage(db)
	userService := services.NewUserService(userStorage)
	userHandler := handlers.NewUserHandler(userService)

	authStorage := storage.NewAuthStorage(db)
	authService := services.NewAuthService(userStorage, authStorage)
	authHandler := handlers.NewAuthHandler(authService)

	// Define routes for /api/users
	router.HandleFunc("/api/users", middleware.ConvertToHandlerFunc(userHandler.GetUserHandler)).Methods("GET")
	router.HandleFunc("/api/auth/register", middleware.ConvertToHandlerFunc(authHandler.CreateUserHandler)).Methods("POST")
	router.HandleFunc("/api/auth/login", middleware.ConvertToHandlerFunc(authHandler.LoginHandler)).Methods("POST")

	return router
}
