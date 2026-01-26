package handlers

import (
	"net/http"
	"strconv"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// AddBookmark adds a post to user's bookmarks
func AddBookmark(c *gin.Context) {
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

	// Check if already bookmarked
	var existingBookmark models.Bookmark
	if err := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&existingBookmark).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Post already bookmarked"})
		return
	}

	bookmark := models.Bookmark{
		UserID: userID.(uint),
		PostID: uint(postID),
	}

	if err := config.DB.Create(&bookmark).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add bookmark"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Post bookmarked successfully", "bookmark": bookmark})
}

// RemoveBookmark removes a post from user's bookmarks
func RemoveBookmark(c *gin.Context) {
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

	result := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&models.Bookmark{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bookmark not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bookmark removed successfully"})
}

// GetBookmarks returns all bookmarks for the authenticated user
func GetBookmarks(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var bookmarks []models.Bookmark
	if err := config.DB.Where("user_id = ?", userID).
		Preload("Post").
		Preload("Post.Author").
		Order("created_at DESC").
		Find(&bookmarks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookmarks"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookmarks": bookmarks, "total": len(bookmarks)})
}

// CheckBookmark checks if a post is bookmarked by the user
func CheckBookmark(c *gin.Context) {
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

	var bookmark models.Bookmark
	if err := config.DB.Where("user_id = ? AND post_id = ?", userID, postID).First(&bookmark).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"bookmarked": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"bookmarked": true})
}
