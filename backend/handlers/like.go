package handlers

import (
	"net/http"
	"strconv"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// AddLike adds a like to a post
func AddLike(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postIDStr := c.Param("postId")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Check if post exists
	var post models.Post
	if err := config.DB.First(&post, postID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Check if already liked (including soft-deleted likes)
	var existingLike models.Like
	err = config.DB.Unscoped().Where("user_id = ? AND post_id = ?", userID, postID).First(&existingLike).Error

	if err == nil {
		// Like record exists
		if existingLike.DeletedAt.Valid {
			// Soft-deleted like exists, restore it
			config.DB.Unscoped().Model(&existingLike).Update("deleted_at", nil)
		} else {
			// Active like exists
			c.JSON(http.StatusConflict, gin.H{"error": "Post already liked"})
			return
		}
	} else {
		// No like record exists, create new one
		like := models.Like{
			UserID: userID.(uint),
			PostID: uint(postID),
		}

		if err := config.DB.Create(&like).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add like"})
			return
		}
	}

	// Get updated like count
	var likeCount int64
	config.DB.Model(&models.Like{}).Where("post_id = ?", postID).Count(&likeCount)

	c.JSON(http.StatusCreated, gin.H{"message": "Post liked successfully", "like_count": likeCount})
}

// RemoveLike removes a like from a post
func RemoveLike(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postIDStr := c.Param("postId")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	result := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&models.Like{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Like not found"})
		return
	}

	// Get updated like count
	var likeCount int64
	config.DB.Model(&models.Like{}).Where("post_id = ?", postID).Count(&likeCount)

	c.JSON(http.StatusOK, gin.H{"message": "Like removed successfully", "like_count": likeCount})
}

// CheckLike checks if a post is liked by the user and returns the like count
func CheckLike(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	postIDStr := c.Param("postId")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	// Get like count
	var likeCount int64
	config.DB.Model(&models.Like{}).Where("post_id = ?", postID).Count(&likeCount)

	// Check if user has liked
	var like models.Like
	liked := false
	if err := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&like).Error; err == nil {
		liked = true
	}

	c.JSON(http.StatusOK, gin.H{"liked": liked, "like_count": likeCount})
}

// GetLikeCount returns the like count for a post (public endpoint)
func GetLikeCount(c *gin.Context) {
	postIDStr := c.Param("postId")
	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var likeCount int64
	config.DB.Model(&models.Like{}).Where("post_id = ?", postID).Count(&likeCount)

	c.JSON(http.StatusOK, gin.H{"like_count": likeCount})
}
