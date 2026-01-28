package handlers

import (
	"net/http"
	"strings"

	"gin-quickstart/config"
	"gin-quickstart/models"

	"github.com/gin-gonic/gin"
)

// GetTopics returns all topics
func GetTopics(c *gin.Context) {
	var topics []models.Topic
	if err := config.DB.Order("name ASC").Find(&topics).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch topics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"topics": topics})
}

// GetTopic returns a single topic by slug
func GetTopic(c *gin.Context) {
	slug := c.Param("slug")

	var topic models.Topic
	if err := config.DB.Where("slug = ?", slug).First(&topic).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}

	// Count followers
	var followerCount int64
	config.DB.Model(&models.TopicFollow{}).Where("topic_id = ?", topic.ID).Count(&followerCount)

	c.JSON(http.StatusOK, gin.H{
		"topic":          topic,
		"follower_count": followerCount,
	})
}

// CreateTopic creates a new topic (could be admin-only in production)
func CreateTopic(c *gin.Context) {
	var input struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required"})
		return
	}

	// Generate slug from name
	slug := strings.ToLower(strings.ReplaceAll(input.Name, " ", "-"))

	// Check if topic exists
	var existing models.Topic
	if err := config.DB.Where("slug = ? OR name = ?", slug, input.Name).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Topic already exists"})
		return
	}

	topic := models.Topic{
		Name:        input.Name,
		Slug:        slug,
		Description: input.Description,
	}

	if err := config.DB.Create(&topic).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create topic"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"topic": topic})
}

// FollowTopic follows a topic
func FollowTopic(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	slug := c.Param("slug")

	// Find topic
	var topic models.Topic
	if err := config.DB.Where("slug = ?", slug).First(&topic).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}

	// Check if already following
	var existingFollow models.TopicFollow
	if err := config.DB.Where("user_id = ? AND topic_id = ?", userID, topic.ID).First(&existingFollow).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Already following this topic"})
		return
	}

	follow := models.TopicFollow{
		UserID:  userID.(uint),
		TopicID: topic.ID,
	}

	if err := config.DB.Create(&follow).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow topic"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Successfully followed topic"})
}

// UnfollowTopic unfollows a topic
func UnfollowTopic(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	slug := c.Param("slug")

	// Find topic
	var topic models.Topic
	if err := config.DB.Where("slug = ?", slug).First(&topic).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}

	result := config.DB.Where("user_id = ? AND topic_id = ?", userID, topic.ID).Delete(&models.TopicFollow{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not following this topic"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully unfollowed topic"})
}

// CheckTopicFollow checks if user is following a topic
func CheckTopicFollow(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	slug := c.Param("slug")

	// Find topic
	var topic models.Topic
	if err := config.DB.Where("slug = ?", slug).First(&topic).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Topic not found"})
		return
	}

	var follow models.TopicFollow
	if err := config.DB.Where("user_id = ? AND topic_id = ?", userID, topic.ID).First(&follow).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"following": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"following": true})
}

// GetUserTopics returns topics followed by the user
func GetUserTopics(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var follows []models.TopicFollow
	if err := config.DB.Where("user_id = ?", userID).
		Preload("Topic").
		Find(&follows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch topics"})
		return
	}

	// Extract topics from follows
	var topics []models.Topic
	for _, f := range follows {
		topics = append(topics, f.Topic)
	}

	c.JSON(http.StatusOK, gin.H{"topics": topics, "total": len(topics)})
}
