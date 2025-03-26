package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
)

type AuthStorage struct {
	DB *sql.DB
}

func NewAuthStorage(db *sql.DB) *AuthStorage {
	return &AuthStorage{
		DB: db,
	}
}

// Retrieve password for
func (s *AuthStorage) RetrieveUserPassword(username string) (*models.User, error) {
	var user models.User
	query := `
	SELECT id, password_hash, username, first_name, last_name, avatar, updated_at, email FROM users
	WHERE username = $1
	`
	err := s.DB.QueryRow(query, username).Scan(&user.ID, &user.PasswordHash, &user.Username, &user.FirstName, &user.LastName, &user.Avatar, &user.UpdatedAt, &user.Email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, &utils.ApiError{Code: http.StatusUnauthorized, Message: "Invalid username or password"}
		}
		return nil, fmt.Errorf("Error scanning user row: %v", err)
	}
	user.Avatar = utils.NormalizeMedia(user.Avatar)
	return &user, nil
}

// Stores a refresh token in the database
func (s *AuthStorage) SaveRefreshToken(userID, refreshToken string, expiresAt time.Time) error {
	query := `
	INSERT INTO refresh_tokens (user_id, refresh_token, expires_at)
	VALUES ($1, $2, $3)
	`

	_, err := s.DB.Query(query, userID, refreshToken, expiresAt)
	if err != nil {
		return &utils.ApiError{Code: http.StatusInternalServerError, Message: "Failed to save refresh token"}
	}

	log.Printf("Successfully saved refresh token for userID: %s", userID)
	return nil
}

// Verifies refresh token exists and is valid
func (s *AuthStorage) VerifyRefreshToken(refreshToken string) (string, error) {
	var userID string
	query := `
	SELECT user_id FROM refresh_tokens
	WHERE refresh_token = $1 AND expires_at > NOW()
	`

	err := s.DB.QueryRow(query, refreshToken).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", &utils.ApiError{Code: http.StatusForbidden, Message: "Refresh token is invalid or expired"}
		}
		return "", fmt.Errorf("Error scanning refresh_tokens: %v", err)
	}
	return userID, nil
}

// Removes a refresh token from the database (used during logout)
func (s *AuthStorage) DeleteRefreshToken(refreshToken string) error {
	query := `DELETE FROM refresh_tokens WHERE refresh_token = $1`
	result, err := s.DB.Exec(query, refreshToken)
	if err != nil {
		return errors.New("internal server error") // Return plain error for 500
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "Refresh token not found"}
	}

	log.Printf("Successfully deleted refresh token: %s", refreshToken)
	return nil
}

// Removes all refresh tokens for a specific user (force logout)
func (s *AuthStorage) DeleteAllTokensForUser(userID string) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	result, err := s.DB.Exec(query, userID)
	if err != nil {
		return err // Return plain error for 500
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "No refresh tokens found for the user"}
	}

	log.Printf("Successfully deleted all refresh tokens for userID: %s", userID)
	return nil
}
