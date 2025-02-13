package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	Storage *storage.UserStorage
}

func NewUserService(storage *storage.UserStorage) *UserService {
	return &UserService{
		Storage: storage,
	}
}

func (s *UserService) CreateUser(user *models.User) error {
	// Check if username or email already exists
	err := s.Storage.CheckForUsernameOrEmail(user)
	
	return err
	
	hashedPassword, err := hashPassword(user.PasswordHash)
	if err != nil {
		return fmt.Errorf("error encrypting password: %s", err.Error())
	}

	user.PasswordHash = string(hashedPassword)
	user.CreatedAt = time.Now().UTC()
	user.UpdatedAt = time.Now().UTC()

	return s.Storage.SaveUser(user)
}

func hashPassword(pw string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
}
