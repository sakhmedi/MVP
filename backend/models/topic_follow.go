package models

import (
	"time"

	"gorm.io/gorm"
)

type TopicFollow struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index;uniqueIndex:idx_user_topic" json:"user_id"`
	TopicID   uint           `gorm:"not null;index;uniqueIndex:idx_user_topic" json:"topic_id"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"-"`
	Topic Topic `gorm:"foreignKey:TopicID" json:"topic,omitempty"`
}
