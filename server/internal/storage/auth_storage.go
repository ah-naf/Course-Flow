package storage

import (
	"collab-editor/internal/utils"
	"database/sql"
	"errors"
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
func (s *AuthStorage) RetrieveUserPassword(username string) (string, string, error) {
	var hashedPass, userID string
	query := `
	SELECT id, password_hash FROM users
	WHERE username = $1
	`
	err := s.DB.QueryRow(query, username).Scan(&userID, &hashedPass)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", "", &utils.ApiError{Code: http.StatusUnauthorized, Message: "Invalid username or password"}
		}
		return "", "", err
	}
	return userID, hashedPass, nil
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
			return "", &utils.ApiError{Code: http.StatusUnauthorized, Message: "Refresh token is invalid or expired"}
		}
		return "", err
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
	return nil
}

// Removes all refresh tokens for a specific user (force logout)
func (s *AuthStorage) DeleteAllTokensForUser(userID string) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	result, err := s.DB.Exec(query, userID)
	if err != nil {
		return errors.New("internal server error") // Return plain error for 500
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "No refresh tokens found for the user"}
	}

	return nil
}
