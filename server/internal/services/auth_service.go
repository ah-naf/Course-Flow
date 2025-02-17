package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-playground/validator"
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
func (s *AuthService) Login(user *models.LoginRequest) (*models.LoginResponse, error) {
	userID, storedHash, err := s.AuthStorage.RetrieveUserPassword(user.Username)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user.Password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	return generateTokens(userID)
}

func (s *AuthService) CreateUser(userReq *models.UserRequest) error {
	// Trim space
	userReq.Email, userReq.FirstName, userReq.LastName, userReq.Username = strings.TrimSpace(userReq.Email), strings.TrimSpace(userReq.FirstName), strings.TrimSpace(userReq.LastName), strings.TrimSpace(userReq.Username)

	// validate user request
	validate := validator.New()
	if err := validate.Struct(userReq); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, err := range validationErrors {
				return &utils.ApiError{
					Code:    "VALIDATION_ERROR",
					Message: getValidationMessage(err),
				}
			}
		} else {
			return err
		}
	}

	user := &models.User{
		Email:        userReq.Email,
		Username:     userReq.Username,
		FirstName:    userReq.FirstName,
		LastName:     userReq.LastName,
		PasswordHash: userReq.Password,
	}

	// Check if user with same email or username exist
	err := s.UserStorage.CheckForUsernameOrEmail(user)
	if err != nil {
		return nil
	}

	hashedPassword, err := hashPassword(user.PasswordHash)
	if err != nil {
		return fmt.Errorf("error encrypting password: %s", err.Error())
	}

	user.PasswordHash = string(hashedPassword)
	user.CreatedAt = time.Now().UTC()
	user.UpdatedAt = time.Now().UTC()

	// save the user
	return s.UserStorage.SaveUser(user)
}

// Generate new access and refresh token
func generateTokens(userID string) (*models.LoginResponse, error) {
	accessToken, err := utils.GenerateToken(userID, 15*time.Minute)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateToken(userID, 7*24*time.Hour) // 7 days
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{AccessToken: accessToken, RefreshToken: refreshToken}, nil
}


func hashPassword(pw string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
}

func getValidationMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return fmt.Sprintf("'%s' is required.", err.Field())
	case "email":
		return fmt.Sprintf("'%s' must be a valid email.", err.Field())
	case "min":
		return fmt.Sprintf("'%s' must be at least %s characters long.", err.Field(), err.Param())
	case "max":
		return fmt.Sprintf("'%s' must be at most %s characters long.", err.Field(), err.Param())
	default:
		return fmt.Sprintf("'%s' is invalid.", err.Field())
	}
}