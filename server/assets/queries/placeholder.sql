INSERT INTO workflow (id, name, description, timeCreated) VALUES
(1, 'Basic',            'Basic task workflow',                         '2025-01-01 00:00:00'),
(2, 'Job Board',        'Track job applications from lead to outcome', '2025-03-01 09:00:00'),
(3, 'Software Project', 'Software development workflow',               '2025-03-15 09:00:00');


INSERT INTO stage (id, workflow, name, description, color, icon, position, type) VALUES
-- Workflow 1: Basic
(1,  1, 'Todo',         'Tasks are being planned',              'gray',   'circle-dashed', 1, 'open'),
(2,  1, 'Doing',        'Tasks are being worked on',            'green',  'circle-dot',    2, 'doing'),
(3,  1, 'Done',         'Tasks are completed',                  'purple', 'circle-check',  3, 'done'),

-- Workflow 2: Job Board
(4,  2, 'Lead',         'Found the job opening',                'gray',   'circle-dashed', 1, 'open'),
(5,  2, 'Applied',      'Applied for the job opening',          'orange', 'circle',        2, 'todo'),
(6,  2, 'Interviewing', 'Interviewing for the job opening',     'green',  'circle-dot',    3, 'doing'),
(7,  2, 'Offered',      'Received offer for the job opening',   'purple', 'circle-check',  4, 'done'),
(8,  2, 'Rejected',     'Application for opening was rejected', 'red',    'circle-check',  5, 'done'),

-- Workflow 3: Software Project
(9,  3, 'Open',         'Tasks are being planned',              'gray',   'circle-dashed', 1, 'open'),
(10, 3, 'Blocked',      'Blocked by other development',         'red',    'circle-minus',  2, 'blocked'),
(11, 3, 'Ready',        'Ready to begin development',           'orange', 'circle',        3, 'todo'),
(12, 3, 'Development',  'Development has begun',                'green',  'circle-dot',    4, 'doing'),
(13, 3, 'Review',       'Testing and review has begun',         'blue',   'circle-dot',    5, 'doing'),
(14, 3, 'Closed',       'Completed or abandoned',               'purple', 'circle-check',  6, 'done');


INSERT INTO project (id, name, pinned, workflow, timeCreated) VALUES
(1, 'Website Redesign', 1, 3, '2025-01-05 09:00:00'),
(2, 'Mobile App',       0, 3, '2025-01-10 10:30:00'),
(3, 'Chores',           0, 1, '2025-02-01 14:15:00'),
(4, 'Job Hunt',         1, 2, '2025-03-05 10:00:00');


INSERT INTO checklist (id, project, name, isDefault, timeCreated) VALUES
(1, 1, 'Planning',       1, '2025-01-05 09:15:00'),
(2, 1, 'Implementation', 0, '2025-01-06 11:00:00'),
(3, 2, 'MVP Tasks',      1, '2025-01-10 11:00:00'),
(4, 2, 'QA & Release',   0, '2025-01-15 16:45:00'),
(5, 3, 'Household',      1, '2025-02-01 15:00:00'),
(6, 3, 'Errands',        0, '2025-02-05 09:00:00'),
(7, 4, 'Tech Giants',    1, '2025-03-05 10:15:00'),
(8, 4, 'Startups',       0, '2025-03-10 11:00:00');


-- Enable all task types for all seeded projects.
-- task_type IDs: 1=Task, 2=Dev, 3=Test, 4=Reminder
INSERT INTO project_task_type (project, task_type) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 4);


INSERT INTO task ( id, checklist, stage, name, body, timeCreated, timeCompleted, timePlannedStart, timePlannedEnd, assignee, priority, type ) VALUES
-- Website Redesign / Planning (project 1, workflow 3)
-- type: 4=Reminder, 2=Dev, 3=Test
(1,  1, 14, 'Gather requirements',        '[]', '2025-01-05 09:30:00', '2025-01-06 10:00:00', '2025-01-06 09:00:00', '2025-01-06 10:00:00', 'Alice',   'High',   4),
(2,  1, 12, 'Create wireframes',          '[]', '2025-01-06 10:30:00', NULL,                  '2025-01-08 12:00:00', '2025-01-08 14:00:00', 'Bob',     'Medium', 2),
-- Website Redesign / Implementation
(3,  2, 11, 'Build landing page',         '[]', '2025-01-07 09:00:00', NULL,                  '2025-01-12 17:00:00', '2025-01-12 18:00:00', 'Charlie', 'High',   2),
(4,  2, 9,  'CSS styling pass',           '[]', '2025-01-08 13:00:00', NULL,                  NULL,                  NULL,                  'Alice',   'Low',    2),
-- Mobile App / MVP Tasks (project 2, workflow 3)
(5,  3, 12, 'Implement login flow',       '[]', '2025-01-10 11:30:00', NULL,                  '2025-01-18 18:00:00', '2025-01-18 19:00:00', 'Diana',   'Urgent', 2),
(6,  3, 10, 'Local storage setup',        '[]', '2025-01-11 09:45:00', NULL,                  NULL,                  NULL,                  'Evan',    'Medium', 2),
-- Mobile App / QA & Release
(7,  4, 11, 'Write test cases',           '[]', '2025-01-15 17:00:00', NULL,                  '2025-01-20 10:00:00', '2025-01-20 12:00:00', 'Frank',   'High',   3),
(8,  4, 9,  'App Store submission',       '[]', '2025-01-18 14:00:00', NULL,                  NULL,                  NULL,                  'Diana',   'Urgent', 4),
-- Chores / Household (project 3, workflow 1)
(9,  5, 3,  'Take out the trash',         '[]', '2026-05-12 08:00:00', '2026-05-13 07:30:00', NULL,                  NULL,                  '', 'Low',    4),
(10, 5, 2,  'Laundry',                    '[]', '2026-05-14 09:00:00', NULL,                  '2026-05-14 18:00:00', '2026-05-14 20:00:00', '', 'Medium', 4),
(11, 5, 1,  'Clean the kitchen',          '[]', '2026-05-14 10:00:00', NULL,                  '2026-05-17 10:00:00', '2026-05-17 12:00:00', '', 'Medium', 4),
(12, 5, 3,  'Mow the lawn',               '[]', '2026-05-08 09:00:00', '2026-05-10 13:00:00', '2026-05-10 11:00:00', '2026-05-10 13:00:00', '', 'Low',    4),
-- Chores / Errands
(13, 6, 1,  'Grocery shopping',           '[]', '2026-05-14 08:30:00', NULL,                  '2026-05-15 17:00:00', '2026-05-15 18:30:00', '', 'Medium', 4),
(14, 6, 3,  'Pay credit card bill',       '[]', '2026-05-10 09:00:00', '2026-05-11 14:00:00', NULL,                  NULL,                  '', 'High',   4),
-- Job Hunt / Tech Giants (project 4, workflow 2)
(15, 7, 4,  'Google - Senior SWE',        '[]', '2025-03-05 11:00:00', NULL,                  NULL,                  NULL,                  '', 'High',   4),
(16, 7, 5,  'Meta - Software Engineer',   '[]', '2025-03-06 09:30:00', NULL,                  '2025-03-09 10:00:00', '2025-03-09 11:00:00', '', 'High',   4),
(17, 7, 6,  'Apple - Frontend Engineer',  '[]', '2025-03-08 14:00:00', NULL,                  '2025-03-15 13:00:00', '2025-03-15 14:00:00', '', 'Urgent', 4),
(18, 7, 5,  'Stripe - Backend Engineer',  '[]', '2025-03-14 16:00:00', NULL,                  '2025-03-16 09:00:00', '2025-03-16 10:00:00', '', 'Medium', 4),
-- Job Hunt / Startups
(19, 8, 7,  'Vercel - DevOps',            '[]', '2025-03-10 11:15:00', '2025-03-20 17:00:00', '2025-03-18 16:00:00', '2025-03-18 17:00:00', '', 'Urgent', 4),
(20, 8, 8,  'Linear - Software Engineer', '[]', '2025-03-12 09:00:00', '2025-03-22 12:00:00', NULL,                  NULL,                  '', 'Medium', 4),
(21, 8, 6,  'Supabase - Backend',         '[]', '2025-03-15 10:00:00', NULL,                  '2025-03-25 14:00:00', '2025-03-25 15:00:00', '', 'High',   4);
