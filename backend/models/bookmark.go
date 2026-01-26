package models

import (
	"time"

	"gorm.io/gorm"
)

type Bookmark struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index;uniqueIndex:idx_user_post_bookmark" json:"user_id"`
	PostID    uint           `gorm:"not null;index;uniqueIndex:idx_user_post_bookmark" json:"post_id"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
	Post Post `gorm:"foreignKey:PostID" json:"post,omitempty"`
}
