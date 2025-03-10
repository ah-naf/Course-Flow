package router

import (
	"collab-editor/internal/handlers"
	"collab-editor/internal/middleware"
	"collab-editor/internal/services"
	"collab-editor/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupCourseRouter(router *mux.Router) {
	courseStorage := storage.NewCourseStorage(r.DB)
	courseService := services.NewCourseService(courseStorage)
	courseHandler := handlers.NewCourseHandler(courseService)

	// Document routes
	router.HandleFunc("/api/courses", middleware.ConvertToHandlerFunc(courseHandler.CreateCourseHandler, middleware.AuthMiddleware)).Methods("POST")
	router.HandleFunc("/api/courses/instructor", middleware.ConvertToHandlerFunc(courseHandler.GetCoursesByInstructorHandler, middleware.AuthMiddleware)).Methods("GET")
}
