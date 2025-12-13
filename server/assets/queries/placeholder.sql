INSERT INTO project (id, name, pinned, timeCreated) VALUES
(1, 'Website Redesign', 1, '2025-01-05 09:00:00'),
(2, 'Mobile App', 1, '2025-01-10 10:30:00'),
(3, 'Internal Tools', 0, '2025-02-01 14:15:00');


INSERT INTO checklist (id, project, name, timeCreated) VALUES
(1, 1, 'Planning', '2025-01-05 09:15:00'),
(2, 1, 'Implementation', '2025-01-06 11:00:00'),
(3, 2, 'MVP Tasks', '2025-01-10 11:00:00'),
(4, 2, 'QA & Release', '2025-01-15 16:45:00'),
(5, 3, 'Maintenance', '2025-02-01 15:00:00');


INSERT INTO task ( id, checklist, name, timeCreated, timeCompleted, timePlanned, assignee, priority, type, status ) VALUES
-- Website Redesign / Planning
(1, 1, 'Gather requirements', '2025-01-05 09:30:00', '2025-01-06 10:00:00', '2025-01-06 09:00:00', 'Alice', 'High', 'Reminder', 'Done'),
(2, 1, 'Create wireframes', '2025-01-06 10:30:00', NULL, '2025-01-08 12:00:00', 'Bob', 'Medium', 'Dev', 'Doing'),
-- Website Redesign / Implementation
(3, 2, 'Build landing page', '2025-01-07 09:00:00', NULL, '2025-01-12 17:00:00', 'Charlie', 'High', 'Dev', 'Todo'),
(4, 2, 'CSS styling pass', '2025-01-08 13:00:00', NULL, NULL, 'Alice', 'Low', 'Dev', 'Open'),
-- Mobile App / MVP Tasks
(5, 3, 'Implement login flow', '2025-01-10 11:30:00', NULL, '2025-01-18 18:00:00', 'Diana', 'Urgent', 'Dev', 'Doing'),
(6, 3, 'Local storage setup', '2025-01-11 09:45:00', NULL, NULL, 'Evan', 'Medium', 'Dev', 'Blocked'),
-- Mobile App / QA & Release
(7, 4, 'Write test cases', '2025-01-15 17:00:00', NULL, '2025-01-20 10:00:00', 'Frank', 'High', 'Test', 'Todo'),
(8, 4, 'App Store submission', '2025-01-18 14:00:00', NULL, NULL, 'Diana', 'Urgent', 'Reminder', 'Open'),
-- Internal Tools / Maintenance
(9, 5, 'Database backup audit', '2025-02-01 15:30:00', '2025-02-02 09:00:00', '2025-02-02 08:00:00', 'Grace', 'Medium', 'Test', 'Done'),
(10, 5, 'Refactor legacy scripts', '2025-02-03 10:00:00', NULL, NULL, 'Henry', 'Low', 'Dev', 'Todo');
