package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"
	"course-flow/internal/storage"

	"github.com/gorilla/mux"
)

func (r *Router) setupCourseMemberRouter(router *mux.Router) {
	cmStorage := storage.NewCourseMemberStorage(r.DB)
	cmService := services.NewCourseMemberService(cmStorage)
	cmHandler := handlers.NewCourseMemberHandler(cmService)

	cmRouter := router.PathPrefix("/members").Subrouter()

	cmRouter.HandleFunc("/{id}", middleware.ConvertToHandlerFunc(cmHandler.GetAllMemberHandler)).Methods("GET")
	cmRouter.HandleFunc("/change-role/{id}", middleware.ConvertToHandlerFunc(cmHandler.ChangeRoleHandler, middleware.AuthMiddleware)).Methods("PUT")
}
