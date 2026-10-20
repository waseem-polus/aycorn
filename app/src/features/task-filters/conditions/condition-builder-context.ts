import { createContext, useContext } from "react";
import type { ConditionTreeAPI } from "@/features/task-filters/conditions/hooks/useConditionTree";
import type { PropertyKey } from "@/features/task-filters/conditions/condition-types";
import type { OptionSource } from "@/features/task-filters/option-groups";

/**
 * The values each enum property can take on this surface. An enum property
 * with no source isn't offered at all — the project page simply omits
 * `project`, since it's already scoped to one.
 */
export type ConditionOptionSources = Partial<Record<PropertyKey, OptionSource>>;

/** Where a dragged node would land: before or after `overId`, or at the end of `groupId` when `overId` is null. */
export type DropTarget = {
  groupId: string;
  overId: string | null;
  after: boolean;
};

type ConditionBuilderContextValue = {
  tree: ConditionTreeAPI;
  sources: ConditionOptionSources;
  activeId: string | null;
  dropTarget: DropTarget | null;
};

export const ConditionBuilderContext =
  createContext<ConditionBuilderContextValue | null>(null);

export function useConditionBuilder(): ConditionBuilderContextValue {
  const ctx = useContext(ConditionBuilderContext);
  if (!ctx) {
    throw new Error("useConditionBuilder must be used inside a ConditionBuilder");
  }
  return ctx;
}
