package models

import "time"

type Project struct {
	ID     int
	Name   string
	Pinned bool
}

type Checklist struct {
	ID   int
	Name string
}

type Task struct {
	ID            int
	Name          string
	TimeCreated   *time.Time
	TimeCompleted *time.Time
	TimePlanned   *time.Time
	Assignee      string
	Priority      string
	Type          string
	Status        string
}
