import type { Checklist } from "@/types/types";

// The project's default checklist, falling back to the first one if none is
// marked default.
export const getDefaultChecklistId = (checklists: Checklist[]) =>
  (checklists.find((c) => c.IsDefault) ?? checklists[0])?.ID;
