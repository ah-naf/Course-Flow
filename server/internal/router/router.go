package router

import (
	"database/sql"

	"github.com/gorilla/mux"
)

type Router struct {
	DB *sql.DB
}

func NewRouter(db *sql.DB) *Router {
	return &Router{db}
}

func (r *Router) Setup() *mux.Router {
	router := mux.NewRouter()

	r.setupUserRouter(router)
	r.setupAuthRoutes(router)
	r.setupDocumentRouter(router)
	r.setupCourseRouter(router)

	return router
}
