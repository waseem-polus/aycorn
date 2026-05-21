import { z } from "zod/v4";
import { TYPES, PRIORITIES } from "@/types/types";

export type TEventFormData = {
  startDate: Date;
  endDate: Date;
};

export const taskSchema = z.object({
  Name: z.string().min(1, "Name is required"),
  Body: z.string().optional(),
  TimePlannedStart: z.date().nullable(),
  TimePlannedEnd: z.date().nullable(),
  Assignee: z.string().min(1, "Assignee is required"),
  Type: z.enum(TYPES),
  Priority: z.enum(PRIORITIES),
  Stage: z.number(),
  Checklist: z.number().default(1),
});

export type TTaskFormData = z.infer<typeof taskSchema>;
