-- PROJECT
INSERT INTO project (id, name) VALUES
(1, 'Inventory Management SaaS'),
(2, 'Mobile Banking App'),
(3, 'AI Code Assistant'),
(4, 'CRM Sales Platform'),
(5, 'Fitness Tracker Wearable App');

-- CHECKLIST
INSERT INTO checklist (id, name) VALUES
(1, 'Project Kickoff'),
(2, 'Requirements Gathering'),
(3, 'UI/UX Design'),
(4, 'Sprint 1 Development'),
(5, 'QA Testing'),
(6, 'Deployment Preparation'),
(7, 'Production Release');

-- PROJECTCHECKLIST
INSERT INTO projectChecklist (project, checklist) VALUES
(1, 1),
(1, 2),
(1, 4),
(2, 1),
(2, 3),
(2, 7),
(3, 1),
(3, 2),
(3, 3),
(3, 4),
(4, 6),
(4, 7),
(5, 1),
(5, 5),
(5, 7);

-- TASK
INSERT INTO task (id, name, timeCompleted, timePlanned, assignee, type, priority) VALUES
(1, 'Research market competitors', NULL, '2025-01-10', 'Sarah', 'research', 'medium'),
(2, 'Create backlog in Jira', NULL, '2025-01-15', 'Alex', 'jira', 'high'),
(3, 'Develop authentication module', NULL, '2025-01-20', 'Sofia', 'development', 'high'),
(4, 'Create UI mockups', NULL, '2025-01-13', 'Marco', 'development', 'medium'),
(5, 'Conduct usability test', NULL, '2025-02-02', 'John', 'testing', 'high'),
(6, 'Weekly stakeholder meeting', NULL, '2025-01-17', 'Sarah', 'meeting', 'low'),
(7, 'Write Gitlab pipeline', NULL, '2025-01-18', 'Alex', 'development', 'urgent'),
(8, 'Create system technical spec', NULL, '2025-01-12', 'Chris', 'documentation', 'high'),
(9, 'Regression test suite', NULL, '2025-02-15', 'John', 'testing', 'medium'),
(10, 'Jira sprint planning session', NULL, '2025-01-09', 'Sarah', 'jira', 'urgent');

-- CHECKLISTTASK
INSERT INTO checklistTask (checklist, task, order) VALUES
(1, 1, 1),
(1, 6, 2),
(1, 2, 3),
(2, 8, 1),
(2, 4, 2),
(3, 4, 1),
(4, 3, 1),
(4, 7, 2),
(5, 5, 1),
(5, 9, 2),
(6, 8, 1),
(6, 7, 2),
(7, 10, 1);
