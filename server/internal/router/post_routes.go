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


	docStorage := storage.NewDocumentStorage(r.DB)
	docService := services.NewDocumentService(docStorage)

	attachmentStorage := storage.NewAttachmentStorage(r.DB)

	attchmentService := services.NewAttachmentService(attachmentStorage, docService)

	postService := services.NewPostService(postStorage, attchmentService)
	postHandler := handlers.NewPostHandler(postService)

	postRouter := router.PathPrefix("/posts").Subrouter()

	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.CreateNewPostHandler, middleware.AuthMiddleware)).Methods("POST")
}