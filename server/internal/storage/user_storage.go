package storage

import (
	"collab-editor/internal/models"
	"collab-editor/internal/utils"
	"database/sql"
)

type UserStorage struct {
	DB *sql.DB
}

func NewUserStorage(db *sql.DB) *UserStorage {
	return &UserStorage{
		DB: db,
	}
}

func (s *UserStorage) GetAllUser() ([]*models.User, error) {
	rows, err := s.DB.Query("SELECT * FROM users")
	if err != nil {
		return nil, err
	}

	var users []*models.User
	for rows.Next() {
		user := new(models.User)
		if err := rows.Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash, &user.FirstName, &user.LastName, &user.CreatedAt, &user.UpdatedAt, &user.LastLogin); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func (s *UserStorage) SaveUser(user *models.User) error {
	query := `
	INSERT into users(email, username, password_hash, first_name, last_name, created_at, updated_at)
	VALUES($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := s.DB.Query(query, user.Email, user.Username, user.PasswordHash, user.FirstName, user.LastName, user.CreatedAt, user.UpdatedAt)
	return err
}

func (s *UserStorage) CheckForUsernameOrEmail(user *models.User) error {
	query := `
		SELECT username, email FROM users WHERE email = $1 OR username = $2
	`
	rows, err := s.DB.Query(query, user.Email, user.Username)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var dbUsername, dbEmail string
		if err := rows.Scan(&dbUsername, &dbEmail); err != nil {
			return err
		}

		// Check for duplicate username.
		if user.Username == dbUsername {
			return &utils.ApiError{
				Code:    "USERNAME_DUPLICATE",
				Message: "Username already exists",
			}
		}

		// Check for duplicate email.
		if user.Email == dbEmail {
			return &utils.ApiError{
				Code:    "EMAIL_DUPLICATE",
				Message: "Email already exists",
			}
		}
	}

	return nil
}
