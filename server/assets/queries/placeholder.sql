INSERT INTO workflow (id, name, description, timeCreated) VALUES
(1, 'Software', 'Default software development workflow', '2025-01-01 00:00:00');


INSERT INTO stage (id, workflow, name, description, color, icon, position, type) VALUES
(1, 1, 'Open',    'Tasks are being planned',   'gray',   'circle-dashed', 1, 'open'),
(2, 1, 'Todo',    'Tasks are ready to start',  'orange', 'circle',        2, 'todo'),
(3, 1, 'Doing',   'Tasks are being worked on', 'green',  'circle-dot',    3, 'doing'),
(4, 1, 'Done',    'Tasks are completed',       'purple', 'circle-check',  4, 'done'),
(5, 1, 'Blocked', 'Tasks cannot be started',   'red',    'circle-minus',  5, 'blocked');


INSERT INTO project (id, name, pinned, workflow, timeCreated) VALUES
(1, 'Website Redesign', 1, 1, '2025-01-05 09:00:00'),
(2, 'Mobile App',       1, 1, '2025-01-10 10:30:00'),
(3, 'Internal Tools',   0, 1, '2025-02-01 14:15:00');


INSERT INTO checklist (id, project, name, isDefault, timeCreated) VALUES
(1, 1, 'Planning', 1, '2025-01-05 09:15:00'),
(2, 1, 'Implementation', 0, '2025-01-06 11:00:00'),
(3, 2, 'MVP Tasks', 1, '2025-01-10 11:00:00'),
(4, 2, 'QA & Release', 0, '2025-01-15 16:45:00'),
(5, 3, 'Maintenance', 1, '2025-02-01 15:00:00');


INSERT INTO task ( id, checklist, stage, name, body, timeCreated, timeCompleted, timePlannedStart, timePlannedEnd, assignee, priority, type ) VALUES
-- Website Redesign / Planning
(1, 1, 4, 'Gather requirements', '[]', '2025-01-05 09:30:00', '2025-01-06 10:00:00', '2025-01-06 09:00:00', '2025-01-06 10:00:00', 'Alice', 'High', 'Reminder'),
(2, 1, 3, 'Create wireframes', '[]', '2025-01-06 10:30:00', NULL, '2025-01-08 12:00:00', '2025-01-08 14:00:00', 'Bob', 'Medium', 'Dev'),
-- Website Redesign / Implementation
(3, 2, 2, 'Build landing page', '[]', '2025-01-07 09:00:00', NULL, '2025-01-12 17:00:00', '2025-01-12 18:00:00', 'Charlie', 'High', 'Dev'),
(4, 2, 1, 'CSS styling pass', '[]', '2025-01-08 13:00:00', NULL, NULL, NULL, 'Alice', 'Low', 'Dev'),
-- Mobile App / MVP Tasks
(5, 3, 3, 'Implement login flow', '[]', '2025-01-10 11:30:00', NULL, '2025-01-18 18:00:00', '2025-01-18 19:00:00', 'Diana', 'Urgent', 'Dev'),
(6, 3, 5, 'Local storage setup', '[]', '2025-01-11 09:45:00', NULL, NULL, NULL, 'Evan', 'Medium', 'Dev'),
-- Mobile App / QA & Release
(7, 4, 2, 'Write test cases', '[]', '2025-01-15 17:00:00', NULL, '2025-01-20 10:00:00', '2025-01-20 12:00:00', 'Frank', 'High', 'Test'),
(8, 4, 1, 'App Store submission', '[]', '2025-01-18 14:00:00', NULL, NULL, NULL, 'Diana', 'Urgent', 'Reminder'),
-- Internal Tools / Maintenance
(9, 5, 4, 'Database backup audit', '[]', '2025-02-01 15:30:00', '2025-02-02 09:00:00', '2025-02-02 08:00:00', '2025-02-02 09:00:00', 'Grace', 'Medium', 'Test'),
(10, 5, 2, 'Refactor legacy scripts', '[]', '2025-02-03 10:00:00', NULL, NULL, NULL, 'Henry', 'Low', 'Dev');
