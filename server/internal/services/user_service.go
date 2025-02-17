package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
)

type UserService struct {
	Storage *storage.UserStorage
}

func NewUserService(storage *storage.UserStorage) *UserService {
	return &UserService{
		Storage: storage,
	}
}

func (s *UserService) GetAllUser() ([]*models.User, error) {
	return s.Storage.GetAllUser()
}
