package models

import (
	"time"

	"gorm.io/gorm"
)

type Follow struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	FollowerID  uint           `gorm:"not null;index;uniqueIndex:idx_follower_following" json:"follower_id"`
	FollowingID uint           `gorm:"not null;index;uniqueIndex:idx_follower_following" json:"following_id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Follower  User `gorm:"foreignKey:FollowerID" json:"-"`
	Following User `gorm:"foreignKey:FollowingID" json:"-"`
}
