package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupCourseRouter(router *mux.Router) {
	courseStorage := storage.NewCourseStorage(r.DB)
	documentStorage := storage.NewDocumentStorage(r.DB)
	courseService := services.NewCourseService(courseStorage, documentStorage)
	courseHandler := handlers.NewCourseHandler(courseService)

	courseRouter := router.PathPrefix("/courses").Subrouter()

	// Document routes
	courseRouter.HandleFunc("", middleware.ConvertToHandlerFunc(courseHandler.CreateCourseHandler, middleware.AuthMiddleware)).Methods("POST")
	courseRouter.HandleFunc("", middleware.ConvertToHandlerFunc(courseHandler.GetCourseForSingleUserHandler, middleware.AuthMiddleware)).Methods("GET")
	courseRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(courseHandler.DeleteCourseHandler, middleware.AuthMiddleware)).Methods("DELETE")
	courseRouter.HandleFunc("/instructor", middleware.ConvertToHandlerFunc(courseHandler.GetCoursesByInstructorHandler, middleware.AuthMiddleware)).Methods("GET")
	courseRouter.HandleFunc("/join", middleware.ConvertToHandlerFunc(courseHandler.JoinCourseHandler, middleware.AuthMiddleware)).Methods("POST")
	courseRouter.HandleFunc("/archive", middleware.ConvertToHandlerFunc(courseHandler.ArchiveCourseHandler, middleware.AuthMiddleware)).Methods("PUT")
	courseRouter.HandleFunc("/restore", middleware.ConvertToHandlerFunc(courseHandler.RestoreArchivedCourseHandler, middleware.AuthMiddleware)).Methods("PUT")
	courseRouter.HandleFunc("/leave/{id}", middleware.ConvertToHandlerFunc(courseHandler.LeaveCourseHandler, middleware.AuthMiddleware)).Methods("DELETE")
	courseRouter.HandleFunc("/preview/{id}", middleware.ConvertToHandlerFunc(courseHandler.CoursePreviewHandler)).Methods("GET")
}

