import { createContext, useContext } from "react";
import type { ConditionTreeAPI } from "@/features/task-filters/conditions/hooks/useConditionTree";
import type { StaticPropertyKey } from "@/features/task-filters/conditions/condition-types";
import type { OptionSource } from "@/features/task-filters/option-groups";
import type { TaskRelationshipType } from "@/types/types";

/**
 * The values each enum property can take on this surface. An enum property
 * with no source isn't offered at all — the project page simply omits
 * `project`, since it's already scoped to one.
 */
export type ConditionOptionSources = Partial<Record<StaticPropertyKey, OptionSource>>;

/** Where a dragged node would land: before or after `overId`, or at the end of `groupId` when `overId` is null. */
export type DropTarget = {
  groupId: string;
  overId: string | null;
  after: boolean;
};

type ConditionBuilderContextValue = {
  tree: ConditionTreeAPI;
  sources: ConditionOptionSources;
  /** Every relationship type; each direction of each one is a link property. */
  linkTypes: TaskRelationshipType[];
  /** The tasks a link condition can point at, across all projects. */
  linkTaskSource: OptionSource;
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
