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
	IsDefault   bool
}

type ChecklistDetails struct {
	Checklist
	DoneCount  int
	TotalCount int
	Status     string
}

type Task struct {
	ID               int
	Checklist        int
	Name             string
	Body             string
	TimeCreated      *time.Time
	TimePlannedStart *time.Time
	TimePlannedEnd   *time.Time
	TimeCompleted    *time.Time
	Assignee         string
	Priority         string
	Type             string
	Status           string
}

type ChecklistTask struct {
	Task
	ChecklistName string
}
