import { createContext, useContext } from "react";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";

export type ProjectFiltersAPI = BoardFilterAPI & {
  /**
   * Whether the planned-date filter is applied on the current view. The month
   * and week views already group by planned date, so the filter stays editable
   * there but is left out of the request.
   */
  plannedFilterApplies: boolean;
};

export const ProjectFiltersContext = createContext<ProjectFiltersAPI | null>(
  null,
);

export function useProjectFiltersContext(): ProjectFiltersAPI {
  const ctx = useContext(ProjectFiltersContext);
  if (!ctx) {
    throw new Error(
      "useProjectFiltersContext must be used inside a ProjectFiltersContext.Provider",
    );
  }
  return ctx;
}
