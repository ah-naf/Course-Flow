package router

import (
	"course-flow/internal/handlers"
	"course-flow/internal/middleware"
	"course-flow/internal/services"

	"github.com/gorilla/mux"
)

func (r *Router) setupNotifRouter(router *mux.Router) {
	notifService := services.NewNotificationService(r.DB)
	notifHandler := handlers.NewNotificationHandler(notifService)

	notifRouter := router.PathPrefix("/notifications").Subrouter()

	notifRouter.HandleFunc("", middleware.ConvertToHandlerFunc(notifHandler.GetAllNotificationForUserHandler, middleware.AuthMiddleware)).Methods("GET")
	notifRouter.HandleFunc("/read", middleware.ConvertToHandlerFunc(notifHandler.MarkNotificationAsReadHandler, middleware.AuthMiddleware)).Methods("POST")
	notifRouter.HandleFunc("/read-all", middleware.ConvertToHandlerFunc(notifHandler.MarkAllNotificationsAsReadHandler, middleware.AuthMiddleware)).Methods("POST")
	notifRouter.HandleFunc("/clear", middleware.ConvertToHandlerFunc(notifHandler.ClearAllNotificationsHandler, middleware.AuthMiddleware)).Methods("POST")
}
