package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"fmt"
	"log"
	"net/http"
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

func (s *AuthService) SocialLogin(userReq models.User) (*models.LoginResponse, error) {
	err := s.UserStorage.CheckForUsernameOrEmail(&userReq)
	if err == nil {
		// if user not found, create new one.
		if err := s.UserStorage.SaveUser(&userReq); err != nil {
			return nil, err
		}
	} else {
		if err := s.UserStorage.GetUserWithEmail(&userReq); err != nil {
			return nil, err
		}
	}

	// Generate access and Refresh token
	accessToken, err := utils.GenerateToken(userReq.ID, 15*time.Minute)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	exp := 7 * 24 * time.Hour
	refreshToken, err := utils.GenerateToken(userReq.ID, exp)
	if err != nil {
		return nil, err
	}

	// Save refresh token to database.
	err = s.AuthStorage.SaveRefreshToken(userReq.ID, refreshToken, time.Now().Add(exp))
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// validate the user and generate JWT token
func (s *AuthService) Login(user *models.LoginRequest) (*models.LoginResponse, error) {
	// retrieve the hashed password fromm db
	userID, storedHash, err := s.AuthStorage.RetrieveUserPassword(user.Username)
	if err != nil {
		return nil, err
	}

	// compare the login password with the hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(user.Password)); err != nil {
		return nil, &utils.ApiError{Code: http.StatusUnauthorized, Message: "Invalid username or password"}
	}

	// create access and refresh token
	accessToken, err := utils.GenerateToken(userID, 15*time.Minute)
	if err != nil {
		return nil, err
	}

	exp := 7 * 24 * time.Hour
	refreshToken, err := utils.GenerateToken(userID, exp) // 7 days
	if err != nil {
		return nil, err
	}

	// save the refresh token in db with a expiration value
	err = s.AuthStorage.SaveRefreshToken(userID, refreshToken, time.Now().Add(exp))
	if err != nil {
		return nil, err
	}

	// if the token is successfully saved, send it to user
	return &models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// Creates new user on registration
func (s *AuthService) CreateUser(userReq *models.UserRequest) error {
	// Trim space
	userReq.Email, userReq.FirstName, userReq.LastName, userReq.Username = strings.TrimSpace(userReq.Email), strings.TrimSpace(userReq.FirstName), strings.TrimSpace(userReq.LastName), strings.TrimSpace(userReq.Username)

	// validate user request
	validate := validator.New()
	if err := validate.Struct(userReq); err != nil {
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, err := range validationErrors {
				return &utils.ApiError{
					Code:    http.StatusBadRequest,
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

// handle logout
func (s *AuthService) Logout(refreshToken string) error {
	if refreshToken == "" {
		return &utils.ApiError{Code: http.StatusNotFound, Message: "Refresh token is required"}
	}

	return s.AuthStorage.DeleteRefreshToken(refreshToken)
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
