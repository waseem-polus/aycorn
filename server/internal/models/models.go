package models

import "time"

type Project struct {
	ID          int
	Name        string
	Pinned      bool
	TimeCreated *time.Time
}

type Checklist struct {
	ID          int
	Name        string
	Project     int
	TimeCreated *time.Time
}

type Task struct {
	ID            int
	Checklist     int
	Name          string
	TimeCreated   *time.Time
	TimeCompleted *time.Time
	TimePlanned   *time.Time
	Assignee      string
	Priority      string
	Type          string
	Status        string
}

type ChecklistTask struct {
	Task
	ChecklistName string
}
