INSERT INTO project (id, name, pinned) VALUES
(1, 'Website Redesign', 1),
(2, 'Mobile App Launch', 0),
(3, 'Internal Tools Upgrade', 0);

INSERT INTO checklist (id, name) VALUES
(1, 'Design Checklist'),
(2, 'QA Checklist'),
(3, 'Deployment Checklist');

INSERT INTO task (id, name, timeCompleted, timePlanned, assignee, priority, type, status) VALUES
(1, 'Create wireframes', NULL, '2025-01-15 09:00:00', 'Alice', 'High', 'Dev', 'Todo'),
(2, 'Review UI mockups', NULL, NULL, 'Bob', 'Medium', 'Dev', 'Open'),
(3, 'Write unit tests', NULL, '2025-01-20 10:00:00', 'Charlie', 'High', 'Test', 'Todo'),
(4, 'Run regression tests', NULL, NULL, 'Dana', 'Urgent', 'Test', 'Blocked'),
(5, 'Prepare deployment notes', NULL, '2025-01-22 08:00:00', 'Alice', 'Low', 'Reminder', 'Open'),
(6, 'Finalize release build', NULL, NULL, 'Eve', 'High', 'Dev', 'Doing'),
(7, 'Send release announcement', NULL, '2025-02-01 12:00:00', 'Frank', 'Medium', 'Reminder', 'Todo');

INSERT INTO projectChecklist (project, checklist) VALUES
(1, 1),  -- Website Redesign → Design Checklist
(1, 2),  -- Website Redesign → QA Checklist
(2, 2),  -- Mobile App Launch → QA Checklist
(2, 3),  -- Mobile App Launch → Deployment Checklist
(3, 3);  -- Internal Tools Upgrade → Deployment Checklist

INSERT INTO checklistTask (checklist, task, taskOrder) VALUES
-- Design Checklist
(1, 1, 1),
(1, 2, 2),
-- QA Checklist
(2, 3, 1),
(2, 4, 2),
-- Deployment Checklist
(3, 5, 1),
(3, 6, 2),
(3, 7, 3);
