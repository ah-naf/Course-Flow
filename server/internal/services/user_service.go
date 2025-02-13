package services

import (
	"collab-editor/internal/models"
	"collab-editor/internal/storage"
	"collab-editor/internal/utils"
	"fmt"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
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

func (s *UserService) GetAllUser() ([]*models.User, error) {
	return s.Storage.GetAllUser()
}

func (s *UserService) CreateUser(userReq *models.UserRequest) error {
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
	err := s.Storage.CheckForUsernameOrEmail(user)
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
	return s.Storage.SaveUser(user)
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
