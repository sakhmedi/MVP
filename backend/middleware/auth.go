package middleware

import (
	"gin-quickstart/config"
	"gin-quickstart/models"
	"gin-quickstart/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT and attaches user info to context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Parse Bearer token format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header format must be Bearer {token}",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Validate JWT token
		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid or expired token",
			})
			c.Abort()
			return
		}

		// Check if token is blacklisted
		var blacklistedToken models.BlacklistedToken
		if err := config.DB.Where("token = ?", tokenString).First(&blacklistedToken).Error; err == nil {
			// Token found in blacklist
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token has been revoked",
			})
			c.Abort()
			return
		}

		// Attach user info to context for downstream handlers
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("username", claims.Username)

		c.Next()
	}
}

// OptionalAuthMiddleware validates JWT if present but doesn't require it
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Next()
			return
		}

		claims, err := utils.ValidateJWT(parts[1])
		if err == nil {
			c.Set("user_id", claims.UserID)
			c.Set("email", claims.Email)
			c.Set("username", claims.Username)
		}

		c.Next()
	}
}
