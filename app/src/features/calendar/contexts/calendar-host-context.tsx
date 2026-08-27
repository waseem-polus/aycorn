import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";
import type { ChecklistTask } from "@/types/types";

/**
 * What the surface hosting a calendar view has to supply.
 *
 * The calendar views are mounted by two very different surfaces: the project
 * page, which has a single ambient project, and /upcoming, which is
 * cross-project. Everything that differs between them lives here so the views
 * themselves stay project-agnostic.
 */
export type CalendarHost = {
  /**
   * Cache/mutation target for drag-reschedule. `null` on cross-project
   * surfaces, where there is no single project to optimistically patch.
   */
  projectId: number | null;

  /**
   * Per-day create affordance. Omitted by surfaces that don't support creating
   * tasks (/upcoming), in which case day cells render no create control.
   */
  renderDayCreate?: (date: Date) => ReactNode;

  /**
   * Told whenever a per-day/per-slot create drawer opens or closes, so the host
   * can pause background refetches that would reset the half-filled form.
   */
  onCreateDrawerOpenChange?: (open: boolean) => void;

  /**
   * Wraps a task's editor subtree so cross-project surfaces can supply the
   * per-task `ProjectContext` the editor drawer reads. Defaults to rendering
   * children unchanged, which is what the project page wants — its provider is
   * already ambient.
   */
  TaskScope?: ComponentType<{
    task: ChecklistTask;
    open: boolean;
    children: ReactNode;
  }>;
};

const defaultHost: CalendarHost = { projectId: null };

const CalendarHostContext = createContext<CalendarHost>(defaultHost);

export function CalendarHostProvider({
  children,
  projectId,
  renderDayCreate,
  onCreateDrawerOpenChange,
  TaskScope,
}: CalendarHost & { children: ReactNode }) {
  const host = useMemo(
    () => ({ projectId, renderDayCreate, onCreateDrawerOpenChange, TaskScope }),
    [projectId, renderDayCreate, onCreateDrawerOpenChange, TaskScope],
  );
  return (
    <CalendarHostContext.Provider value={host}>
      {children}
    </CalendarHostContext.Provider>
  );
}

export function useCalendarHost() {
  return useContext(CalendarHostContext);
}

/** Default `TaskScope` — the project page needs no extra wrapping. */
export function PassthroughTaskScope({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
