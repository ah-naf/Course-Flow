package storage

import (
	"collab-editor/internal/models"
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

func (s *UserStorage) SaveUser(user *models.User) error {
	return nil
}
