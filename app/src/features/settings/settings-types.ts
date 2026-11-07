/** date-fns' convention: 0 = Sunday, 1 = Monday. */
export type WeekStartsOn = 0 | 1;

export type AppSettings = {
  weekStartsOn: WeekStartsOn;
};

/** Used until the server answers, matching the migration's default. */
export const DEFAULT_APP_SETTINGS: AppSettings = { weekStartsOn: 1 };
