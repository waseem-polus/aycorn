package models

import "time"

type Project struct {
	ID           int
	Name         string
	Pinned       bool
	Workflow     int
	TimeCreated  *time.Time
	TimeModified *time.Time
}

type Checklist struct {
	ID           int
	Name         string
	Project      int
	TimeCreated  *time.Time
	TimeModified *time.Time
	IsDefault    bool
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
	Stage            int
	Name             string
	Body             string
	TimeCreated      *time.Time
	TimeModified     *time.Time
	TimePlannedStart *time.Time
	TimePlannedEnd   *time.Time
	TimeCompleted    *time.Time
	Assignee         string
	Priority         string
	Type             string
}

type ChecklistTask struct {
	Task
	ChecklistName string
}

type Workflow struct {
	ID           int
	Name         string
	Description  string
	TimeCreated  *time.Time
	TimeModified *time.Time
}

type Stage struct {
	ID           int
	Workflow     int
	Name         string
	Description  string
	Color        string
	Icon         string
	Position     int
	Type         string
	TimeCreated  *time.Time
	TimeModified *time.Time
}
