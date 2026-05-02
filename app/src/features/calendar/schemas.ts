import { z } from "zod/v4";
import { TYPES, PRIORITIES, STATUSES } from "@/types/types";

export const taskSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Body: z.string().optional(),
  TimePlannedStart: z.date().nullable(),
  TimePlannedEnd: z.date().nullable(),
  Assignee: z.string().min(1, "Assignee is required"),
  Type: z.enum(TYPES),
  Priority: z.enum(PRIORITIES),
  Status: z.enum(STATUSES),
  Checklist: z.number().default(1),
});

export type TTaskFormData = z.infer<typeof taskSchema>;
