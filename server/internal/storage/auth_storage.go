package storage

import (
	"database/sql"
	"errors"
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
			return "", "", errors.New("invalid credential")
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
	return err
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
			return "", errors.New("invalid or expired refresh token")
		}
		return "", err
	}
	return userID, nil
}

// Removes a refresh token from the database (used during logout)
func (s *AuthStorage) DeleteRefreshToken(refreshToken string) error {
	query := `DELETE FROM refresh_tokens WHERE refresh_token = $1`
	_, err := s.DB.Exec(query, refreshToken)
	return err
}

// Removes all refresh tokens for a specific user (force logout)
func (s *AuthStorage) DeleteAllTokensForUser(userID string) error {
	query := `DELETE FROM refresh_tokens WHERE user_id = $1`
	_, err := s.DB.Exec(query, userID)
	return err
}
