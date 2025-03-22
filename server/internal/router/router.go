package router

import (
	"course-flow/internal/utils"
	"database/sql"
	"net/http"

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

	apiRouter_v1 := router.PathPrefix("/api/v1").Subrouter()

	r.setupUserRouter(apiRouter_v1)
	r.setupAuthRouter(apiRouter_v1)
	r.setupCourseRouter(apiRouter_v1)
	r.setupCourseMemberRouter(apiRouter_v1)
	r.setupPostRouter(apiRouter_v1)

	mediaDir := utils.GetEnv("MEDIA_DIR")
	fs := http.FileServer(http.Dir(mediaDir))
	router.PathPrefix("/media/").Handler(http.StripPrefix("/media/", fs))
	return router
}
