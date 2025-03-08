package utils

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

type contextKey string

const userIDKey contextKey = "userID"

// GenerateStateOauthCookie creates a random state string for OAuth and stores it in a cookie.
func GenerateStateOauthCookie(w http.ResponseWriter) string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		// Fallback if random generation fails.
		b = []byte(GetEnv("OAUTH_COOKIE_FALLBACK"))
	}

	state := base64.URLEncoding.EncodeToString(b)
	cookie := http.Cookie{
		Name:     "oauthstate",
		Value:    state,
		Expires:  time.Now().Add(1 * time.Hour),
		HttpOnly: true,
		Secure:   false, // TODO: use true in production
	}

	http.SetCookie(w, &cookie)
	return state
}

func ExtractUserIDFromToken(r *http.Request) (string, error) {
	secret_key := GetEnv("SECRET_KEY")

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", &ApiError{Code: http.StatusNotFound, Message: "Missing access token"}
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	fmt.Println("access token", tokenString)
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret_key), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Name}))

	if err != nil {
		if err == jwt.ErrTokenExpired {
			return "", &ApiError{Code: http.StatusUnauthorized, Message: "token has expired"}
		}
		return "", &ApiError{Code: http.StatusUnauthorized, Message: "invalid token: " + err.Error()}
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", &ApiError{Code: http.StatusUnauthorized, Message: "invalid token claims"}
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", &ApiError{Code: http.StatusUnauthorized, Message: "user id not found in the token"}
	}

	return userID, nil
}

// SetUserIDInContext stores the user ID in request context
func SetUserIDInContext(ctx context.Context, userID string) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

// GetUserIDFromContext retrieves the user ID from request context
func GetUserIDFromContext(ctx context.Context) (string, error) {
	userID, ok := ctx.Value(userIDKey).(string)
	if !ok || userID == "" {
		return "", &ApiError{Code: http.StatusUnauthorized, Message: "user id not found in the context"}
	}
	return userID, nil
}

func GenerateToken(userID string, exp time.Duration) (string, error) {
	secret_key := GetEnv("SECRET_KEY")

	claims := jwt.MapClaims{
		"sub": userID,
		// "exp": time.Now().Add(exp).Unix(),
		"exp": jwt.NewNumericDate(time.Now().Add(exp)).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// fmt.Println(token.Claims.(jwt.MapClaims))
	return token.SignedString([]byte(secret_key))
}

func WriteJSON(w http.ResponseWriter, statusCode int, v any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(v)
}

func GetEnv(key string) string {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	secret_key := os.Getenv(key)
	if secret_key == "" {
		log.Fatalln("Secret key is empty")
	}

	return secret_key
}

type ApiError struct {
	Code    int
	Message string
}

func (e *ApiError) Error() string {
	return e.Message
}
