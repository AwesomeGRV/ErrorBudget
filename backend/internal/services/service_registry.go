package services

import (
	"slo-platform/internal/models"

	"gorm.io/gorm"
)

type ServiceRegistry struct {
	db *gorm.DB
}

func NewServiceRegistry(db *gorm.DB) *ServiceRegistry {
	return &ServiceRegistry{db: db}
}

func (sr *ServiceRegistry) CreateService(service *models.Service) error {
	return sr.db.Create(service).Error
}

func (sr *ServiceRegistry) GetService(id uint) (*models.Service, error) {
	var service models.Service
	err := sr.db.Preload("SLOs").Preload("Dependencies").First(&service, id).Error
	return &service, err
}

func (sr *ServiceRegistry) GetServiceByName(name, environment string) (*models.Service, error) {
	var service models.Service
	err := sr.db.Preload("SLOs").Where("name = ? AND environment = ?", name, environment).First(&service).Error
	return &service, err
}

func (sr *ServiceRegistry) ListServices() ([]models.Service, error) {
	var services []models.Service
	err := sr.db.Preload("SLOs").Find(&services).Error
	return services, err
}

func (sr *ServiceRegistry) UpdateService(service *models.Service) error {
	return sr.db.Save(service).Error
}

func (sr *ServiceRegistry) DeleteService(id uint) error {
	return sr.db.Delete(&models.Service{}, id).Error
}

func (sr *ServiceRegistry) AddDependency(serviceID, dependsOnID uint, depType string, critical bool) error {
	dependency := models.ServiceDependency{
		ServiceID:    serviceID,
		DependsOnID:  dependsOnID,
		Type:         depType,
		Critical:     critical,
	}
	return sr.db.Create(&dependency).Error
}

func (sr *ServiceRegistry) RemoveDependency(serviceID, dependsOnID uint) error {
	return sr.db.Where("service_id = ? AND depends_on_id = ?", serviceID, dependsOnID).Delete(&models.ServiceDependency{}).Error
}
