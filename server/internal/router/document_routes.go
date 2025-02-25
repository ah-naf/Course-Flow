package router

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupDocumentRouter(router *mux.Router) {
	// Initialize document-related components
	documentStorage := storage.NewDocumentStorage(r.DB)
	documentService := services.NewDocumentService(documentStorage)
	documentHandler := handlers.NewDocumentHandler(documentService)

	// Document routes
	router.HandleFunc("/api/document", middleware.ConvertToHandlerFunc(documentHandler.UploadDocumentHandler)).Methods("POST")
}
