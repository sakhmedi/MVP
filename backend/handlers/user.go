package handlers

import (
	"log"
	"net/http"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// GetUserProfile retrieves a user's public profile by username
func GetUserProfile(c *gin.Context) {
	username := c.Param("username")
	log.Printf("GetUserProfile called with username: %s", username) // Debug log

	var user models.User
	if err := config.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Count followers (users following this user)
	var followerCount int64
	config.DB.Model(&models.Follow{}).Where("following_id = ?", user.ID).Count(&followerCount)

	// Count following (users this user follows)
	var followingCount int64
	config.DB.Model(&models.Follow{}).Where("follower_id = ?", user.ID).Count(&followingCount)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":              user.ID,
			"username":        user.Username,
			"full_name":       user.FullName,
			"bio":             user.Bio,
			"avatar":          user.Avatar,
			"follower_count":  followerCount,
			"following_count": followingCount,
			"created_at":      user.CreatedAt,
		},
	})
}

// GetUserPosts retrieves published posts by a specific user
func GetUserPosts(c *gin.Context) {
	username := c.Param("username")

	// First find the user
	var user models.User
	if err := config.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get only published posts by this user
	var posts []models.Post
	if err := config.DB.Where("author_id = ? AND published = ?", user.ID, true).
		Preload("Author").
		Order("published_at DESC").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"total": len(posts),
	})
}
