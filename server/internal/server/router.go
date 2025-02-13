package server

import (
	"collab-editor/internal/handlers"
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

	// Define routes for /api/users
	router.HandleFunc("/api/users/register", userHandler.CreateUserHandler).Methods("POST")

	return router
}
