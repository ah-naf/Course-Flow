package utils

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

func GenerateToken(userID string, exp time.Duration) (string, error) {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using system environment variables")
	}

	secret_key := os.Getenv("SECRET_KEY")
	if secret_key == "" {
		log.Fatalln("Secret key is empty")
	}

	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(exp),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// fmt.Println(token.Claims.(jwt.MapClaims))
	return token.SignedString([]byte(secret_key))
}

func WriteJSON(w http.ResponseWriter, statusCode int, v any) error {
	w.WriteHeader(statusCode)
	w.Header().Add("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(v)
}

type ApiError struct {
	Code    string
	Message string
}

func (e *ApiError) Error() string {
	return e.Message
}
