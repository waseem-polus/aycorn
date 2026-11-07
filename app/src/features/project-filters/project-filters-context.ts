import { createContext, useContext } from "react";
import type { BoardFilterAPI } from "@/features/saved-filters/hooks/useBoardFilter";

export type ProjectFiltersAPI = BoardFilterAPI;

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
