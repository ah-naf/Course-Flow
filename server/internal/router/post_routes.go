package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupPostRouter(router *mux.Router) {
	postStorage := storage.NewPostStorage(r.DB)
	postService := services.NewPostService(postStorage)
	postHandler := handlers.NewPostHandler(postService)

	postRouter := router.PathPrefix("/posts").Subrouter()

	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.CreateNewPostHandler, middleware.AuthMiddleware)).Methods("POST")
}