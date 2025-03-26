package storage

import (
	"course-flow/internal/models"
	"course-flow/internal/utils"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
)

type UserStorage struct {
	DB *sql.DB
}

func NewUserStorage(db *sql.DB) *UserStorage {
	return &UserStorage{
		DB: db,
	}
}

func (s *UserStorage) GetUserWithID(userID string) (*models.User, error) {
	var user models.User

	query := `
		SELECT id, email, username, first_name, last_name, created_at, updated_at, avatar
		FROM users
		WHERE id = $1
	`
	err := s.DB.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Avatar,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, &utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "User not found",
			}
		}
		return nil, fmt.Errorf("error fetching user with id %s: %w", userID, err)
	}
	user.Avatar = utils.NormalizeMedia(user.Avatar)
	return &user, nil
}

func (s *UserStorage) EditUserDetails(user *models.User) error {
	tx, err := s.DB.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	query := `
		UPDATE users
		SET first_name = $1, last_name = $2, avatar = $3, updated_at = $4
		WHERE id = $5
		RETURNING id, first_name, last_name, avatar, email, username
	`

	err = tx.QueryRow(
		query,
		user.FirstName,
		user.LastName,
		user.Avatar,
		user.UpdatedAt,
		user.ID,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Avatar,
		&user.Email,
		&user.Username,
	)

	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			return &utils.ApiError{
				Code:    404,
				Message: "user not found or you dont have the permission",
			}
		}
		return fmt.Errorf("failed to update user details for user with id %s: %w", user.ID, err)
	}

	if err := tx.Commit(); err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to commit transaction for user with id %s: %w", user.ID, err)
	}
	user.Avatar = utils.NormalizeMedia(user.Avatar)
	log.Printf("Successfully updated user details for user with id %s", user.ID)
	return nil
}

func (s *UserStorage) GetUserWithEmail(user *models.User) error {
	query := `
		SELECT id, email, username, password_hash, first_name, last_name, created_at, updated_at, avatar
		FROM users
		WHERE email = $1
	`
	err := s.DB.QueryRow(query, user.Email).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Avatar,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return &utils.ApiError{
				Code:    http.StatusNotFound,
				Message: "User not found with the provided email",
			}
		}
		return fmt.Errorf("error fetching user with email %s: %w", user.Email, err)
	}
	user.Avatar = utils.NormalizeMedia(user.Avatar)
	return nil
}

func (s *UserStorage) GetAllUser() ([]*models.User, error) {
	rows, err := s.DB.Query("SELECT * FROM users")
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}

	var users []*models.User
	for rows.Next() {
		user := new(models.User)
		if err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.FirstName, &user.LastName, &user.CreatedAt, &user.UpdatedAt, &user.Avatar); err != nil {
			return nil, fmt.Errorf("failed to scan user row: %w", err)
		}
		user.Avatar = utils.NormalizeMedia(user.Avatar)
		users = append(users, user)
	}
	return users, nil
}

func (s *UserStorage) SaveUser(user *models.User) error {
	query := `
	INSERT INTO users(email, username, password_hash, first_name, last_name, created_at, updated_at, avatar)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id, email, username, password_hash, first_name, last_name, created_at, updated_at, avatar
	`
	err := s.DB.QueryRow(query, user.Email, user.Username, user.PasswordHash, user.FirstName, user.LastName, user.CreatedAt, user.UpdatedAt, user.Avatar).Scan(
		&user.ID,
		&user.Email,
		&user.Username,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.Avatar,
	)
	if err != nil {
		return fmt.Errorf("failed to save user: %w", err)
	}
	user.Avatar = utils.NormalizeMedia(user.Avatar)
	log.Printf("Successfully saved new user with id %s and email %s", user.ID, user.Email)
	return nil
}

func (s *UserStorage) CheckForUsernameOrEmail(user *models.User) error {
	query := `
		SELECT username, email FROM users WHERE email = $1 OR username = $2
	`
	rows, err := s.DB.Query(query, user.Email, user.Username)
	if err != nil {
		return fmt.Errorf("failed to query for username or email: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var dbUsername, dbEmail string
		if err := rows.Scan(&dbUsername, &dbEmail); err != nil {
			return fmt.Errorf("failed to scan username or email: %w", err)
		}

		// Check for duplicate username.
		if user.Username == dbUsername {
			return &utils.ApiError{
				Code:    http.StatusConflict,
				Message: "Username already exists",
			}
		}

		// Check for duplicate email.
		if user.Email == dbEmail {
			return &utils.ApiError{
				Code:    http.StatusConflict,
				Message: "Email already exists",
			}
		}
	}

	return nil
}
