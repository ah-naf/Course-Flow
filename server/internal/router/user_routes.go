package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupUserRouter(router *mux.Router) {
	// Initialize user-related components
	userStorage := storage.NewUserStorage(r.DB)
	userService := services.NewUserService(userStorage)
	userHandler := handlers.NewUserHandler(userService)

	userRouter := router.PathPrefix("/users").Subrouter()

	// User routes
	userRouter.HandleFunc("/", middleware.ConvertToHandlerFunc(userHandler.GetUserHandler)).Methods("GET")
}
