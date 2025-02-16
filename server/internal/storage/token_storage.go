package storage

import (
	"database/sql"
	"errors"
	"time"
)

type TokenStorage struct {
	DB *sql.DB
}

func NewTokenStorage(db *sql.DB) *TokenStorage {
	return &TokenStorage{
		DB: db,
	}
} 

// Stores a refresh token in the database
func(s *TokenStorage) SaveRefreshToken(userID, refreshToken string, expiresAt time.Time) error {
	query := `
	INSERT INTO refresh_tokens (user_id, refresh_token, expiresAt)
	VALUES ($1, $2, $3)
	`
	_, err := s.DB.Query(query, userID, refreshToken, expiresAt)
	return err
}

// Verifies refresh token exists and is valid
func(s *TokenStorage) VerifyRefreshToken(refreshToken string) (string, error) {
	var userID string
	query := `
	SELECT user_id FROM refresh_tokens
	WHERE refresh_token = $1 AND expires_at > NOW()
	`

	err := s.DB.QueryRow(query, refreshToken).Scan(&userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("invalid or expired refresh token")
		}
		return "", err
	}
	return userID, nil
}

// Removes a refresh token from the database (used during logout)
func (s *TokenStorage) DeleteRefreshToken(refreshToken string) error {
	query := `DELETE FROM refresh_tokens WHERE refresh_token = $1`
	_, err := s.DB.Exec(query, refreshToken)
	return err
}

// Removes all refresh tokens for a specific user (force logout)
func (s *TokenStorage) DeleteAllTokensForUser(userID string) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	_, err := s.DB.Exec(query, userID)
	return err
}