package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupDocumentRouter(router *mux.Router) {
	// Initialize document-related components
	documentStorage := storage.NewDocumentStorage(r.DB)
	documentService := services.NewDocumentService(documentStorage)
	documentHandler := handlers.NewDocumentHandler(documentService)

	documentRouter := router.PathPrefix("/documents").Subrouter()

	// Document routes
	documentRouter.HandleFunc("/", middleware.ConvertToHandlerFunc(documentHandler.UploadDocumentHandler)).Methods("POST")
}
