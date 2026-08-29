INSERT INTO workflow (id, name, description, timeCreated) VALUES
(1, 'Basic',            'Basic task workflow',                         '2025-01-01T00:00:00Z'),
(2, 'Job Board',        'Track job applications from lead to outcome', '2025-03-01T09:00:00Z'),
(3, 'Software Project', 'Software development workflow',               '2025-03-15T09:00:00Z');


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
(10, 3, 'Backlog',      'Tasks waiting to be picked up',        'orange', 'circle',        2, 'todo'),
(11, 3, 'Ready',        'Ready to begin development',           'orange', 'circle',        3, 'todo'),
(12, 3, 'Development',  'Development has begun',                'green',  'circle-dot',    4, 'doing'),
(13, 3, 'Review',       'Testing and review has begun',         'blue',   'circle-dot',    5, 'doing'),
(14, 3, 'Closed',       'Completed or abandoned',               'purple', 'circle-check',  6, 'done');


INSERT INTO project (id, name, workflow, folder, timeCreated) VALUES
(1, 'Website Redesign', 3, (SELECT id FROM project_folder WHERE isDefault = 1), '2025-01-05T09:00:00Z'),
(2, 'Mobile App',       3, (SELECT id FROM project_folder WHERE isDefault = 1), '2025-01-10T10:30:00Z'),
(3, 'Chores',           1, (SELECT id FROM project_folder WHERE isDefault = 1), '2025-02-01T14:15:00Z'),
(4, 'Job Hunt',         2, (SELECT id FROM project_folder WHERE isDefault = 1), '2025-03-05T10:00:00Z');


INSERT INTO pinned_project (project, sortIndex) VALUES
(1, 0),
(4, 1);


INSERT INTO checklist (id, project, name, isDefault, timeCreated) VALUES
(1, 1, 'Planning',       1, '2025-01-05T09:15:00Z'),
(2, 1, 'Implementation', 0, '2025-01-06T11:00:00Z'),
(3, 2, 'MVP Tasks',      1, '2025-01-10T11:00:00Z'),
(4, 2, 'QA & Release',   0, '2025-01-15T16:45:00Z'),
(5, 3, 'Household',      1, '2025-02-01T15:00:00Z'),
(6, 3, 'Errands',        0, '2025-02-05T09:00:00Z'),
(7, 4, 'Tech Giants',    1, '2025-03-05T10:15:00Z'),
(8, 4, 'Startups',       0, '2025-03-10T11:00:00Z');


-- Seeds the DEPRECATED project_task_type table so a reset dev DB still matches
-- production. Nothing reads it; task types are available in every project.
-- task_type IDs: 1=Task, 2=Dev, 3=Test, 4=Reminder
INSERT INTO project_task_type (project, task_type) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 4);


INSERT INTO task ( id, checklist, stage, name, body, timeCreated, timeCompleted, timePlannedStart, timePlannedEnd, assignee, priority, type ) VALUES
-- Website Redesign / Planning (project 1, workflow 3)
-- type: 4=Reminder, 2=Dev, 3=Test
(1,  1, 14, 'Gather requirements',        '[]', '2025-01-05T09:30:00Z', '2025-01-06T10:00:00Z', '2025-01-06T09:00:00Z', '2025-01-06T10:00:00Z', 'Alice',   'High',   4),
(2,  1, 12, 'Create wireframes',          '[]', '2025-01-06T10:30:00Z', NULL,                  '2025-01-08T12:00:00Z', '2025-01-08T14:00:00Z', 'Bob',     'Medium', 2),
-- Website Redesign / Implementation
(3,  2, 11, 'Build landing page',         '[]', '2025-01-07T09:00:00Z', NULL,                  '2025-01-12T17:00:00Z', '2025-01-12T18:00:00Z', 'Charlie', 'High',   2),
(4,  2, 9,  'CSS styling pass',           '[]', '2025-01-08T13:00:00Z', NULL,                  NULL,                  NULL,                  'Alice',   'Low',    2),
-- Mobile App / MVP Tasks (project 2, workflow 3)
(5,  3, 12, 'Implement login flow',       '[]', '2025-01-10T11:30:00Z', NULL,                  '2025-01-18T18:00:00Z', '2025-01-18T19:00:00Z', 'Diana',   'Urgent', 2),
(6,  3, 10, 'Local storage setup',        '[]', '2025-01-11T09:45:00Z', NULL,                  NULL,                  NULL,                  'Evan',    'Medium', 2),
-- Mobile App / QA & Release
(7,  4, 11, 'Write test cases',           '[]', '2025-01-15T17:00:00Z', NULL,                  '2025-01-20T10:00:00Z', '2025-01-20T12:00:00Z', 'Frank',   'High',   3),
(8,  4, 9,  'App Store submission',       '[]', '2025-01-18T14:00:00Z', NULL,                  NULL,                  NULL,                  'Diana',   'Urgent', 4),
-- Chores / Household (project 3, workflow 1)
(9,  5, 3,  'Take out the trash',         '[]', '2026-05-12T08:00:00Z', '2026-05-13T07:30:00Z', NULL,                  NULL,                  '', 'Low',    4),
(10, 5, 2,  'Laundry',                    '[]', '2026-05-14T09:00:00Z', NULL,                  '2026-05-14T18:00:00Z', '2026-05-14T20:00:00Z', '', 'Medium', 4),
(11, 5, 1,  'Clean the kitchen',          '[]', '2026-05-14T10:00:00Z', NULL,                  '2026-05-17T10:00:00Z', '2026-05-17T12:00:00Z', '', 'Medium', 4),
(12, 5, 3,  'Mow the lawn',               '[]', '2026-05-08T09:00:00Z', '2026-05-10T13:00:00Z', '2026-05-10T11:00:00Z', '2026-05-10T13:00:00Z', '', 'Low',    4),
-- Chores / Errands
(13, 6, 1,  'Grocery shopping',           '[]', '2026-05-14T08:30:00Z', NULL,                  '2026-05-15T17:00:00Z', '2026-05-15T18:30:00Z', '', 'Medium', 4),
(14, 6, 3,  'Pay credit card bill',       '[]', '2026-05-10T09:00:00Z', '2026-05-11T14:00:00Z', NULL,                  NULL,                  '', 'High',   4),
-- Job Hunt / Tech Giants (project 4, workflow 2)
(15, 7, 4,  'Google - Senior SWE',        '[]', '2025-03-05T11:00:00Z', NULL,                  NULL,                  NULL,                  '', 'High',   4),
(16, 7, 5,  'Meta - Software Engineer',   '[]', '2025-03-06T09:30:00Z', NULL,                  '2025-03-09T10:00:00Z', '2025-03-09T11:00:00Z', '', 'High',   4),
(17, 7, 6,  'Apple - Frontend Engineer',  '[]', '2025-03-08T14:00:00Z', NULL,                  '2025-03-15T13:00:00Z', '2025-03-15T14:00:00Z', '', 'Urgent', 4),
(18, 7, 5,  'Stripe - Backend Engineer',  '[]', '2025-03-14T16:00:00Z', NULL,                  '2025-03-16T09:00:00Z', '2025-03-16T10:00:00Z', '', 'Medium', 4),
-- Job Hunt / Startups
(19, 8, 7,  'Vercel - DevOps',            '[]', '2025-03-10T11:15:00Z', '2025-03-20T17:00:00Z', '2025-03-18T16:00:00Z', '2025-03-18T17:00:00Z', '', 'Urgent', 4),
(20, 8, 8,  'Linear - Software Engineer', '[]', '2025-03-12T09:00:00Z', '2025-03-22T12:00:00Z', NULL,                  NULL,                  '', 'Medium', 4),
(21, 8, 6,  'Supabase - Backend',         '[]', '2025-03-15T10:00:00Z', NULL,                  '2025-03-25T14:00:00Z', '2025-03-25T15:00:00Z', '', 'High',   4);

-- Example task relationships, centered on task 1 ("Gather requirements") so its
-- card shows a spread of every behavior/direction. relationshipType IDs:
-- 1 = blocking (blocks / blocked by), 2 = subtask (parent / subtask), 3 = link (mentions / mentioned by).
-- Tasks 9 and 14 are in a done stage, so they exercise the "resolved"/"done" counts.
INSERT INTO task_relationship (fromTask, toTask, relationshipType) VALUES
    (2,  1,  1),  -- task 2 blocks task 1        -> task 1: blocked by (unresolved)
    (9,  1,  1),  -- task 9 blocks task 1        -> task 1: blocked by (resolved, 9 is done)
    (1,  3,  1),  -- task 1 blocks task 3        -> task 1: blocks 1
    (1,  4,  2),  -- task 1 parent of task 4     -> task 1: subtask (not done)
    (1,  14, 2),  -- task 1 parent of task 14    -> task 1: subtask (done, cross-project)
    (1,  5,  3),  -- task 1 mentions task 5      -> task 1: mentions (cross-project)
    (1,  15, 3),  -- task 1 mentions task 15     -> task 1: mentions (cross-project)
    (6,  1,  3);  -- task 6 mentions task 1      -> task 1: mentioned by
