package router

import (
	"course-flow/internal/utils"
	"course-flow/internal/websocket"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

type Router struct {
	DB  *sql.DB
	Hub *websocket.Hub
}

func NewRouter(db *sql.DB) *Router {
	hub := websocket.NewHub()
	go hub.Run()
	return &Router{DB: db, Hub: hub}
}

func (r *Router) Setup() *mux.Router {
	router := mux.NewRouter()

	apiRouter_v1 := router.PathPrefix("/api/v1").Subrouter()

	apiRouter_v1.HandleFunc("/ws", r.setupWebSocketHandler).Methods("GET")

	r.setupUserRouter(apiRouter_v1)
	r.setupAuthRouter(apiRouter_v1)
	r.setupCourseRouter(apiRouter_v1)
	r.setupCourseMemberRouter(apiRouter_v1)
	r.setupPostRouter(apiRouter_v1)
	r.setupAttachmentRouter(apiRouter_v1)

	mediaDir := utils.GetEnv("MEDIA_DIR")
	fs := http.FileServer(http.Dir(mediaDir))
	router.PathPrefix("/media/").Handler(http.StripPrefix("/media/", fs))
	return router
}

func (R *Router) setupWebSocketHandler(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "Missing authentication token", http.StatusUnauthorized)
		return
	}

	// Retrieve secret key
	secret_key := utils.GetEnv("SECRET_KEY")
	if secret_key == "" {
		log.Println("ERROR: Secret key not configured")
		http.Error(w, "Server configuration error", http.StatusInternalServerError)
		return
	}

	// Parse and validate token
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret_key), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))

	if err != nil {
		var errorMessage string
		var statusCode int

		switch {
		case errors.Is(err, jwt.ErrTokenExpired):
			errorMessage = "Authentication token has expired"
			statusCode = http.StatusUnauthorized
		case errors.Is(err, jwt.ErrTokenMalformed):
			errorMessage = "Malformed authentication token"
			statusCode = http.StatusUnauthorized
		case errors.Is(err, jwt.ErrTokenSignatureInvalid):
			errorMessage = "Invalid token signature"
			statusCode = http.StatusUnauthorized
		default:
			errorMessage = "Token validation failed"
			statusCode = http.StatusUnauthorized
		}

		log.Printf("WebSocket authentication error: %v", err)
		http.Error(w, errorMessage, statusCode)
		return
	}

	// Extract claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	// Extract user ID
	userID, ok := claims["sub"].(string)
	if !ok || userID == "" {
		http.Error(w, "User ID not found in token", http.StatusUnauthorized)
		return
	}

	// For now, we don't need class memberships, so pass an empty map
	classMap := make(map[string]bool)
	R.Hub.Handler(userID, classMap)(w, r)
}
