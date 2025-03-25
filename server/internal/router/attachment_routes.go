package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupAttachmentRouter(router *mux.Router) {
	docStorage := storage.NewDocumentStorage(r.DB)
	docService := services.NewDocumentService(docStorage)

	attachmentStorage := storage.NewAttachmentStorage(r.DB)
	attachmentService := services.NewAttachmentService(attachmentStorage, docService)
	attachmentHandler := handlers.NewAttachmentHandler(attachmentService)

	attahcmentRouter := router.PathPrefix("/attachments").Subrouter()

	// User routes
	attahcmentRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(attachmentHandler.GetAllAttachmentsForCourseHandler, middleware.AuthMiddleware)).Methods("GET")
}
