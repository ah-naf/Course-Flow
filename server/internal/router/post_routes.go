package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/notifications"
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

	postCreatedNotifier := notifications.NewPostCreatedNotifier(r.Hub, r.DB)
	commentAddedNotifier := notifications.NewCommentAddedNotifier(r.Hub, r.DB)

	postHandler := handlers.NewPostHandler(postService, postCreatedNotifier, commentAddedNotifier)

	postRouter := router.PathPrefix("/posts").Subrouter()

	// Get all posts for a course id
	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.GetAllPostHandler)).Methods("GET")
	// Create new posts for a course id
	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.CreateNewPostHandler, middleware.AuthMiddleware)).Methods("POST")
	// Delete a post with specific post ID
	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.DeletePostHandler, middleware.AuthMiddleware)).Methods("DELETE")
	// Edit a post with specific post ID
	postRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(postHandler.EditPostHandler, middleware.AuthMiddleware)).Methods("PUT")
	postRouter.HandleFunc("/comment/{post_id}", middleware.ConvertToHandlerFunc(postHandler.AddCommentHandler, middleware.AuthMiddleware)).Methods("POST")
	postRouter.HandleFunc("/comment/{post_id}", middleware.ConvertToHandlerFunc(postHandler.GetCommentForPostHandler, middleware.AuthMiddleware)).Methods("GET")
	postRouter.HandleFunc("/comment/{comment_id}", middleware.ConvertToHandlerFunc(postHandler.EditommentHandler, middleware.AuthMiddleware)).Methods("PUT")
	postRouter.HandleFunc("/comment/{comment_id}", middleware.ConvertToHandlerFunc(postHandler.DeleteCommentHandler, middleware.AuthMiddleware)).Methods("DELETE")
}
