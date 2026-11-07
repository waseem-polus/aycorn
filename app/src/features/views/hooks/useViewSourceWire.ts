import { useMemo } from "react";
import { fromDefinition } from "@/features/saved-filters/filter-definition";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import type { WireGroup } from "@/features/task-filters/conditions/condition-types";
import { toWire } from "@/features/task-filters/conditions/condition-wire";
import { useToday } from "@/features/task-filters/hooks/useToday";
import type { BoardView } from "@/features/views/view-types";

/**
 * A view's saved source as request conditions — empty when it filters
 * nothing. Relative dates resolve against today, so they re-send at midnight.
 */
export function useViewSourceWire(view: BoardView | null): WireGroup[] {
  const today = useToday();
  const { weekStartsOn } = useAppSettingsQuery().settings;
  const sourceJson = view ? JSON.stringify(view.Source) : "";
  return useMemo(() => {
    if (!sourceJson) return [];
    const wire = toWire(fromDefinition(JSON.parse(sourceJson)), { today, weekStartsOn });
    return wire ? [wire] : [];
  }, [sourceJson, today, weekStartsOn]);
}
