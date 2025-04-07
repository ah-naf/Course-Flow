package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupChatRouter(router *mux.Router) {
	chatStorage := storage.NewChatStorage(r.DB)
	userStorage := storage.NewUserStorage(r.DB)

	chatService := services.NewChatService(chatStorage, userStorage)

	chatHandler := handlers.NewChatHandler(chatService)

	chatRouter := router.PathPrefix("/chat").Subrouter()

	chatRouter.HandleFunc("/{course_id}", middleware.ConvertToHandlerFunc(chatHandler.GetMessageHandler, middleware.AuthMiddleware)).Methods("GET")
}
