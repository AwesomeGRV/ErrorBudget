package database

import (
	"slo-platform/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewConnection(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Service{},
		&models.ServiceDependency{},
		&models.SLO{},
		&models.MetricIngest{},
	)
}
