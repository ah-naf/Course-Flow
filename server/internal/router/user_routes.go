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
	documentStorage := storage.NewDocumentStorage(r.DB)
	userService := services.NewUserService(userStorage, documentStorage)
	userHandler := handlers.NewUserHandler(userService)

	userRouter := router.PathPrefix("/users").Subrouter()

	// User routes
	userRouter.HandleFunc("", middleware.ConvertToHandlerFunc(userHandler.GetUserHandler)).Methods("GET")
	userRouter.HandleFunc("/me", middleware.ConvertToHandlerFunc(userHandler.GetUserWithIDHandler, middleware.AuthMiddleware)).Methods("GET")
	userRouter.HandleFunc("/edit", middleware.ConvertToHandlerFunc(userHandler.EditUserDetailsHadnler, middleware.AuthMiddleware)).Methods("PUT")
}
