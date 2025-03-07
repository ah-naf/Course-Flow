package handlers

import (
	"collab-editor/internal/models"
	"collab-editor/internal/services"
	"collab-editor/internal/utils"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthHandler struct {
	Service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{Service: service}
}

// Handles POST /api/auth/login resquests to login user
func (h *AuthHandler) LoginHandler(w http.ResponseWriter, r *http.Request) error {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return err
	}

	tokens, err := h.Service.Login(&req)
	if err != nil {
		return err
	}
	return utils.WriteJSON(w, http.StatusOK, tokens)
}

// Handles POST /api/auth/register requests to register a new user.
func (h *AuthHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) error {
	var userReq models.UserRequest
	if err := json.NewDecoder(r.Body).Decode(&userReq); err != nil {
		return err
	}

	// convert userReq to model.User
	if err := h.Service.CreateUser(&userReq); err != nil {
		return err
	}

	// Respond with the created user details (excluding password)
	return utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "User created successfully",
		"user":    userReq,
	})
}

// Handles POST /api/auth/logout request to logout an user
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		return utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request payload"})
	}

	ctx := r.Context()
	_, err := utils.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	err = h.Service.Logout(req.RefreshToken)
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

var GoogleOAuthConfig = &oauth2.Config{
	RedirectURL:  utils.GetEnv("GOOGLE_REDIRECT_URL"),
	ClientID:     utils.GetEnv("GOOGLE_CLIENT_ID"),
	ClientSecret: utils.GetEnv("GOOGLE_CLIENT_SECRET"),
	Scopes: []string{
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
	},
	Endpoint: google.Endpoint,
}

// HandleGoogleLogin redirects the client to Google's OAuth2 consent screen.
func (h *AuthHandler) HandleGoogleLogin(w http.ResponseWriter, r *http.Request) error {
	// Generate a state value for CSRF protection and store it in a cookie.
	state := utils.GenerateStateOauthCookie(w)

	// Generate the OAuth2 URL for Google.
	url := GoogleOAuthConfig.AuthCodeURL(state)

	// Redirect the user to Google's OAuth consent page.
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
	return nil
}

// HandleGoogleCallback handles the OAuth2 callback from Google.
func (h *AuthHandler) HandleGoogleCallback(w http.ResponseWriter, r *http.Request) error {
	// Retrieve the state from the cookie.
	stateCookie, err := r.Cookie("oauthstate")
	if err != nil {
		return &utils.ApiError{Code: http.StatusBadRequest, Message: "State cookie not found"}
	}

	// Verify that the state parameter matches the stored state.
	if r.FormValue("state") != stateCookie.Value {
		return &utils.ApiError{Code: http.StatusUnauthorized, Message: "Invalid OAuth state"}
	}

	// Exchange the code for an access token.
	code := r.FormValue("code")
	token, err := GoogleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		return &utils.ApiError{Code: http.StatusInternalServerError, Message: "Failed to exchange token"}
	}

	// Create an HTTP client using the obtained token.
	client := GoogleOAuthConfig.Client(context.Background(), token)

	// Fetch user info from Google's API.
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return &utils.ApiError{Code: http.StatusInternalServerError, Message: "Failed to get user info"}
	}
	defer resp.Body.Close()

	var userInfo struct {
		ID            string `json:"id"`
		Email         string `json:"email"`
		VerifiedEmail bool   `json:"verified_email"`
		Name          string `json:"name"`
		GivenName     string `json:"given_name"`
		FamilyName    string `json:"family_name"`
		Picture       string `json:"picture"`
		Locale        string `json:"locale"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return &utils.ApiError{Code: http.StatusInternalServerError, Message: "Failed to decode user info"}
	}

	loginResp, err := h.Service.SocialLogin(models.User{
		Email:     userInfo.Email,
		FirstName: userInfo.GivenName,
		LastName:  userInfo.FamilyName,
		Avatar:    userInfo.Picture,
		Username:  userInfo.Email,
		UpdatedAt: time.Now(),
		CreatedAt: time.Now(),
	})
	if err != nil {
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, loginResp)
}
