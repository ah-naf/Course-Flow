package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"errors"
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserStorage *storage.UserStorage
	AuthStorage *storage.AuthStorage
}

func NewAuthService(userStorage *storage.UserStorage, authStorage *storage.AuthStorage) *AuthService {
	return &AuthService{
		UserStorage: userStorage,
		AuthStorage: authStorage,
	}
}

// validate the user and generate JWT token
func (s *AuthService) Login(user *models.LoginRequest) (string, string, error) {
	userID, storedHash, err := s.AuthStorage.RetrieveUserPassword(user.Username)
	if err != nil {
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user.Password)); err != nil {
		return "", "", errors.New("invalid username or password")
	}

	accessToken, err := utils.GenerateToken(userID, 15*time.Minute)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := utils.GenerateToken(userID, 7*24*time.Hour) // 7 days
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// Generate new access and refresh token
func (s *AuthService) GenerateTokens(userId string) (string, string, error) {
	accessToken, err := utils.GenerateToken(userId, 15*time.Minute)
	if err != nil {
		return "", "", err
	}
	fmt.Println(accessToken)
	return "", "", nil
}

// Login
