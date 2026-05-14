import type { StageType } from "@/types/types";

export type StageTypeRule = {
  label: string;
  min: number;
  max: number;
};

export const STAGE_TYPE_RULES: Record<StageType, StageTypeRule> = {
  open: { label: "exactly 1", min: 1, max: 1 },
  todo: { label: "optional", min: 0, max: Infinity },
  doing: { label: "≥1 required", min: 1, max: Infinity },
  done: { label: "≥1 required", min: 1, max: Infinity },
  blocked: { label: "optional", min: 0, max: Infinity },
};

export const STAGE_TYPE_COLORS: Record<StageType, string> = {
  open: "gray",
  todo: "orange",
  doing: "green",
  done: "purple",
  blocked: "red",
};
