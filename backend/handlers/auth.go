package handlers

import (
	"gin-quickstart/config"
	"gin-quickstart/models"
	"gin-quickstart/utils"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// RegisterRequest - Signup request body
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Username string `json:"username" binding:"required"`
	FullName string `json:"full_name"` // Optional
	Bio      string `json:"bio"`       // Optional
	Avatar   string `json:"avatar"`    // Optional
}

// LoginRequest - Login request body
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse - Standardized auth response
type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// ErrorResponse - Standardized error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// Register creates a new user account
func Register(c *gin.Context) {
	var req RegisterRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "Invalid request: " + err.Error(),
		})
		return
	}

	// Additional password validation
	if err := utils.ValidatePassword(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	// Validate username format
	if err := utils.ValidateUsername(req.Username); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: err.Error(),
		})
		return
	}

	// Check if user already exists (email OR username)
	var existingUser models.User
	if err := config.DB.Where("email = ? OR username = ?",
		strings.ToLower(req.Email), req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, ErrorResponse{
			Error: "Email or username already exists",
		})
		return
	}

	// Create new user
	user := models.User{
		Email:    strings.ToLower(req.Email), // Normalize email
		Username: req.Username,
		FullName: req.FullName,
		Bio:      req.Bio,
		Avatar:   req.Avatar,
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to process password",
		})
		return
	}

	// Save to database
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to create user",
		})
		return
	}

	// Return success message without token - user must login
	c.JSON(http.StatusCreated, gin.H{
		"message": "Registration successful. Please login to continue.",
		"user":    user,
	})
}

// Login authenticates a user and returns a JWT token
func Login(c *gin.Context) {
	var req LoginRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "Invalid request: " + err.Error(),
		})
		return
	}

	// Find user by email (case-insensitive)
	var user models.User
	if err := config.DB.Where("email = ?", strings.ToLower(req.Email)).
		First(&user).Error; err != nil {
		// Generic error to prevent user enumeration
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Invalid email or password",
		})
		return
	}

	// Verify password
	if err := user.CheckPassword(req.Password); err != nil {
		// Same generic error
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Invalid email or password",
		})
		return
	}

	// Generate access token (short-lived, 15 minutes)
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to generate access token",
		})
		return
	}

	// Generate refresh token (long-lived, 7 days)
	refreshToken, expiresAt, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to generate refresh token",
		})
		return
	}

	// Save refresh token to database
	refreshTokenModel := models.RefreshToken{
		UserID:    user.ID,
		Token:     refreshToken,
		ExpiresAt: expiresAt,
	}
	if err := config.DB.Create(&refreshTokenModel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to save refresh token",
		})
		return
	}

	// Return both tokens and user info
	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"user":          user,
	})
}

// GetCurrentUser returns the authenticated user's profile
func GetCurrentUser(c *gin.Context) {
	// Get user ID from context (set by AuthMiddleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "User not authenticated",
		})
		return
	}

	// Fetch fresh user data from database
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error: "User not found",
		})
		return
	}

	// Return user info
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// RefreshTokenRequest - Refresh token request body
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshTokenHandler exchanges a refresh token for a new access token
func RefreshTokenHandler(c *gin.Context) {
	var req RefreshTokenRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "Invalid request: " + err.Error(),
		})
		return
	}

	// Validate refresh token
	userID, err := utils.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Invalid or expired refresh token",
		})
		return
	}

	// Check if refresh token exists in database and is not expired
	var refreshTokenModel models.RefreshToken
	if err := config.DB.Where("token = ? AND user_id = ? AND expires_at > ?",
		req.RefreshToken, userID, time.Now()).First(&refreshTokenModel).Error; err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Refresh token not found or expired",
		})
		return
	}

	// Fetch user data
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, ErrorResponse{
			Error: "User not found",
		})
		return
	}

	// Generate new access token
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{
			Error: "Failed to generate access token",
		})
		return
	}

	// Return new access token
	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
	})
}

// LogoutRequest - Logout request body
type LogoutRequest struct {
	AccessToken  string `json:"access_token" binding:"required"`
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Logout invalidates both access and refresh tokens
func Logout(c *gin.Context) {
	var req LogoutRequest

	// Bind and validate JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ErrorResponse{
			Error: "Invalid request: " + err.Error(),
		})
		return
	}

	// Validate and get expiry time from access token
	claims, err := utils.ValidateJWT(req.AccessToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Invalid access token",
		})
		return
	}

	// Blacklist the access token
	blacklistedToken := models.BlacklistedToken{
		Token:     req.AccessToken,
		ExpiresAt: claims.ExpiresAt.Time,
	}
	if err := config.DB.Create(&blacklistedToken).Error; err != nil {
		// If token already blacklisted, ignore the error
		if !strings.Contains(err.Error(), "duplicate") {
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Error: "Failed to blacklist access token",
			})
			return
		}
	}

	// Delete refresh token from database
	if err := config.DB.Where("token = ?", req.RefreshToken).Delete(&models.RefreshToken{}).Error; err != nil {
		// Continue even if refresh token deletion fails (might already be deleted)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
