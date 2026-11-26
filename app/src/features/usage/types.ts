export type UsageComparison = {
  Current: number;
  Previous: number;
};

/** Share (0–100) of tasks due in a window that were done by their deadline;
 * null when nothing was due in that window. */
export type UsageRate = {
  Current: number | null;
  Previous: number | null;
  CurrentDue: number;
  CurrentOnTime: number;
  PreviousDue: number;
  PreviousOnTime: number;
};

export type UsagePriority = {
  Urgent: number;
  High: number;
  Overdue: number;
};

/** One local calendar day; Date is YYYY-MM-DD. */
export type UsageDay = {
  Date: string;
  Created: number;
  Completed: number;
};

export type Usage = {
  WindowDays: number;
  ActiveProjects: number;
  NewProjects: number;
  CompletedTasks: UsageComparison;
  OnTimeRate: UsageRate;
  OpenPriority: UsagePriority;
  Activity: UsageDay[];
};
