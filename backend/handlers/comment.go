package handlers

import (
	"net/http"
	"strconv"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// CreateComment creates a new comment on a post
func CreateComment(c *gin.Context) {
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

	var input struct {
		Content  string `json:"content" binding:"required"`
		ParentID *uint  `json:"parent_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
		return
	}

	// If replying to a comment, verify parent exists
	if input.ParentID != nil {
		var parentComment models.Comment
		if err := config.DB.First(&parentComment, *input.ParentID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Parent comment not found"})
			return
		}
	}

	comment := models.Comment{
		UserID:   userID.(uint),
		PostID:   uint(postID),
		ParentID: input.ParentID,
		Content:  input.Content,
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	// Preload user for response
	config.DB.Preload("User").First(&comment, comment.ID)

	c.JSON(http.StatusCreated, gin.H{"comment": comment})
}

// GetPostComments returns all comments for a post
func GetPostComments(c *gin.Context) {
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

	// Get top-level comments with replies
	var comments []models.Comment
	if err := config.DB.Where("post_id = ? AND parent_id IS NULL", postID).
		Preload("User").
		Preload("Replies").
		Preload("Replies.User").
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	// Count total comments
	var total int64
	config.DB.Model(&models.Comment{}).Where("post_id = ?", postID).Count(&total)

	c.JSON(http.StatusOK, gin.H{"comments": comments, "total": total})
}

// UpdateComment updates a comment
func UpdateComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// Check ownership
	if comment.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this comment"})
		return
	}

	var input struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Content is required"})
		return
	}

	comment.Content = input.Content
	if err := config.DB.Save(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment"})
		return
	}

	config.DB.Preload("User").First(&comment, comment.ID)

	c.JSON(http.StatusOK, gin.H{"comment": comment})
}

// DeleteComment deletes a comment
func DeleteComment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	commentIDStr := c.Param("id")
	commentID, err := strconv.ParseUint(commentIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var comment models.Comment
	if err := config.DB.First(&comment, commentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// Check ownership
	if comment.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this comment"})
		return
	}

	// Delete comment and its replies
	config.DB.Where("parent_id = ?", commentID).Delete(&models.Comment{})
	config.DB.Delete(&comment)

	c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// GetUserComments returns posts that the user has commented on
func GetUserComments(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get distinct post IDs that user has commented on
	var postIDs []uint
	config.DB.Model(&models.Comment{}).
		Where("user_id = ?", userID).
		Distinct("post_id").
		Pluck("post_id", &postIDs)

	if len(postIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{"posts": []models.Post{}, "total": 0})
		return
	}

	var posts []models.Post
	if err := config.DB.Where("id IN ?", postIDs).
		Preload("Author").
		Order("created_at DESC").
		Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts, "total": len(posts)})
}

// GetUserResponses returns replies to user's posts (comments others made on user's posts)
func GetUserResponses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get post IDs that belong to the user
	var userPostIDs []uint
	config.DB.Model(&models.Post{}).Where("author_id = ?", userID).Pluck("id", &userPostIDs)

	if len(userPostIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{"comments": []models.Comment{}, "total": 0})
		return
	}

	// Get comments on user's posts (excluding user's own comments)
	var comments []models.Comment
	if err := config.DB.Where("post_id IN ? AND user_id != ?", userPostIDs, userID).
		Preload("User").
		Preload("Post").
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch responses"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments, "total": len(comments)})
}
