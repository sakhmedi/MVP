package handlers

import (
	"net/http"
	"strconv"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// FollowUser follows a user
func FollowUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	username := c.Param("username")

	// Find user to follow
	var userToFollow models.User
	if err := config.DB.Where("username = ?", username).First(&userToFollow).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Can't follow yourself
	if userToFollow.ID == userID.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot follow yourself"})
		return
	}

	// Check if already following
	var existingFollow models.Follow
	if err := config.DB.Where("follower_id = ? AND following_id = ?", userID, userToFollow.ID).First(&existingFollow).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Already following this user"})
		return
	}

	follow := models.Follow{
		FollowerID:  userID.(uint),
		FollowingID: userToFollow.ID,
	}

	if err := config.DB.Create(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully followed user"})
}

// UnfollowUser unfollows a user
func UnfollowUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	username := c.Param("username")

	// Find user to unfollow
	var userToUnfollow models.User
	if err := config.DB.Where("username = ?", username).First(&userToUnfollow).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	result := config.DB.Where("follower_id = ? AND following_id = ?", userID, userToUnfollow.ID).Delete(&models.Follow{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not following this user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed user"})
}

// CheckFollowing checks if the authenticated user is following another user
func CheckFollowing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	username := c.Param("username")

	// Find user
	var user models.User
	if err := config.DB.Where("username = ?", username).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var follow models.Follow
	if err := config.DB.Where("follower_id = ? AND following_id = ?", userID, user.ID).First(&follow).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"following": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"following": true})
}

// GetFollowingFeed returns posts from users that the authenticated user follows
func GetFollowingFeed(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	// Get IDs of users being followed
	var followingIDs []uint
	config.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Pluck("following_id", &followingIDs)

	if len(followingIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"posts": []models.Post{},
			"total": 0,
			"page":  page,
			"limit": limit,
		})
		return
	}

	var posts []models.Post
	var total int64

	query := config.DB.Where("author_id IN ? AND published = ?", followingIDs, true).Preload("Author")
	query.Model(&models.Post{}).Count(&total)

	if err := query.Order("published_at DESC").Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// GetSuggestedUsers returns users to follow (users not currently followed)
func GetSuggestedUsers(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "3"))
	if limit < 1 || limit > 10 {
		limit = 3
	}

	// Get IDs of users already being followed
	var followingIDs []uint
	config.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Pluck("following_id", &followingIDs)

	// Add current user to exclude list
	excludeIDs := append(followingIDs, userID.(uint))

	var users []models.User
	query := config.DB.Where("id NOT IN ?", excludeIDs)

	if err := query.Limit(limit).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Build response with follower counts
	type UserSuggestion struct {
		ID            uint   `json:"id"`
		Username      string `json:"username"`
		FullName      string `json:"full_name"`
		Bio           string `json:"bio"`
		Avatar        string `json:"avatar"`
		FollowerCount int64  `json:"follower_count"`
	}

	var suggestions []UserSuggestion
	for _, u := range users {
		var followerCount int64
		config.DB.Model(&models.Follow{}).Where("following_id = ?", u.ID).Count(&followerCount)

		suggestions = append(suggestions, UserSuggestion{
			ID:            u.ID,
			Username:      u.Username,
			FullName:      u.FullName,
			Bio:           u.Bio,
			Avatar:        u.Avatar,
			FollowerCount: followerCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": suggestions})
}

// GetFollowingWriters returns users that the authenticated user follows
func GetFollowingWriters(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get IDs of users being followed
	var followingIDs []uint
	config.DB.Model(&models.Follow{}).Where("follower_id = ?", userID).Pluck("following_id", &followingIDs)

	if len(followingIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{"users": []models.User{}, "total": 0})
		return
	}

	var users []models.User
	if err := config.DB.Where("id IN ?", followingIDs).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Build response with follower counts
	type UserWithStats struct {
		ID            uint   `json:"id"`
		Username      string `json:"username"`
		FullName      string `json:"full_name"`
		Bio           string `json:"bio"`
		Avatar        string `json:"avatar"`
		FollowerCount int64  `json:"follower_count"`
	}

	var result []UserWithStats
	for _, u := range users {
		var followerCount int64
		config.DB.Model(&models.Follow{}).Where("following_id = ?", u.ID).Count(&followerCount)

		result = append(result, UserWithStats{
			ID:            u.ID,
			Username:      u.Username,
			FullName:      u.FullName,
			Bio:           u.Bio,
			Avatar:        u.Avatar,
			FollowerCount: followerCount,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": result, "total": len(result)})
}
