package models

import (
	"time"

	"gorm.io/gorm"
)

type Service struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"uniqueIndex;not null"`
	OwnerTeam   string    `json:"owner_team" gorm:"not null"`
	Environment string    `json:"environment" gorm:"not null"`
	Version     string    `json:"version"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	SLOs        []SLO     `json:"slos,omitempty" gorm:"foreignKey:ServiceID"`
	Dependencies []ServiceDependency `json:"dependencies,omitempty" gorm:"foreignKey:ServiceID"`
}

type ServiceDependency struct {
	ID           uint   `json:"id" gorm:"primaryKey"`
	ServiceID    uint   `json:"service_id" gorm:"not null"`
	DependsOnID uint   `json:"depends_on_id" gorm:"not null"`
	Type         string `json:"type"` // "api", "database", "queue", etc.
	Critical     bool   `json:"critical" gorm:"default:false"`
	
	Service      Service `json:"-" gorm:"foreignKey:ServiceID"`
	DependsOn    Service `json:"-" gorm:"foreignKey:DependsOnID"`
}

type SLIType string

const (
	SLITypeAvailability SLIType = "availability"
	SLITypeLatency      SLIType = "latency"
	SLITypeErrorRate    SLIType = "error_rate"
	SLITypeCustom       SLIType = "custom"
)

type SLO struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	ServiceID      uint      `json:"service_id" gorm:"not null"`
	Name           string    `json:"name" gorm:"not null"`
	Description    string    `json:"description"`
	SLIType        SLIType   `json:"sli_type" gorm:"not null"`
	Target         float64   `json:"target" gorm:"not null"` // 0.999 for 99.9%
	TimeWindowDays int       `json:"time_window_days" gorm:"not null"`
	
	// SLI configuration
	PrometheusQuery string  `json:"prometheus_query"`
	SuccessMetric   string  `json:"success_metric"`
	TotalMetric     string  `json:"total_metric"`
	LatencyThreshold float64 `json:"latency_threshold"` // for latency SLOs
	
	// Burn rate thresholds
	FastBurnThreshold  float64 `json:"fast_burn_threshold" gorm:"default:2.0"`
	SlowBurnThreshold  float64 `json:"slow_burn_threshold" gorm:"default:1.0"`
	
	// Error budget policy
	HardBudgetPolicy bool `json:"hard_budget_policy" gorm:"default:false"`
	
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	Service Service `json:"service,omitempty" gorm:"foreignKey:ServiceID"`
	
	// Runtime fields (not persisted)
	CurrentStatus    *SLOStatus `json:"current_status,omitempty" gorm:"-"`
	ErrorBudget      *ErrorBudget `json:"error_budget,omitempty" gorm:"-"`
}

type SLOStatus struct {
	SLOID              uint    `json:"slo_id"`
	ServiceName        string  `json:"service_name"`
	SLOName            string  `json:"slo_name"`
	CurrentSLI         float64 `json:"current_sli"`        // 0.9987
	Target             float64 `json:"target"`            // 0.999
	Status             string  `json:"status"`             // "healthy", "degraded", "breached"
	RemainingBudget    float64 `json:"remaining_budget"`   // 0.87 (87%)
	ConsumedBudget     float64 `json:"consumed_budget"`    // 0.13 (13%)
	CurrentBurnRate    float64 `json:"current_burn_rate"`  // 1.2
	FastBurnRate       float64 `json:"fast_burn_rate"`     // 0.8
	SlowBurnRate       float64 `json:"slow_burn_rate"`     // 1.1
	TimeToExhaustion   int     `json:"time_to_exhaustion"` // hours until budget exhausted
	LastUpdated        time.Time `json:"last_updated"`
}

type ErrorBudget struct {
	SLOID           uint      `json:"slo_id"`
	TotalBudget     float64   `json:"total_budget"`     // 0.001 for 99.9% target
	ConsumedBudget  float64   `json:"consumed_budget"`  // 0.00013
	RemainingBudget float64   `json:"remaining_budget"` // 0.00087
	RemainingPercent float64  `json:"remaining_percent"` // 87.0
	
	// Burn rate analysis
	CurrentBurnRate float64 `json:"current_burn_rate"` // 1.2x normal consumption
	FiveMinuteBurn  float64 `json:"five_minute_burn"`  // burn rate over last 5 min
	OneHourBurn     float64 `json:"one_hour_burn"`     // burn rate over last 1 hour
	SixHourBurn     float64 `json:"six_hour_burn"`     // burn rate over last 6 hours
	TwentyFourHourBurn float64 `json:"twenty_four_hour_burn"` // burn rate over last 24h
	
	LastUpdated time.Time `json:"last_updated"`
}

type DeployDecision string

const (
	DeployDecisionSafe   DeployDecision = "SAFE"
	DeployDecisionRisky  DeployDecision = "RISKY"
	DeployDecisionBlocked DeployDecision = "BLOCKED"
)

type DeployCheck struct {
	ServiceName    string        `json:"service_name"`
	Environment    string        `json:"environment"`
	Decision       DeployDecision `json:"decision"`
	Reason         string        `json:"reason"`
	RemainingBudget float64      `json:"remaining_budget"`
	BurnRate       float64       `json:"burn_rate"`
	RecentIncidents bool          `json:"recent_incidents"`
	LastSLOBreach  *time.Time    `json:"last_slo_breach,omitempty"`
	CheckedAt      time.Time     `json:"checked_at"`
}

type MetricIngest struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ServiceID uint      `json:"service_id" gorm:"not null"`
	SLOID     uint      `json:"slo_id" gorm:"not null"`
	Timestamp time.Time `json:"timestamp" gorm:"not null"`
	Value     float64   `json:"value" gorm:"not null"`
	MetricType string   `json:"metric_type"` // "success", "total", "latency"
	
	CreatedAt time.Time `json:"created_at"`
}
