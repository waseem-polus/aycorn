import { createContext, useContext } from "react";
import type { useUpcomingFilters } from "@/features/upcoming/hooks/useUpcomingFilters";

export type UpcomingFiltersAPI = ReturnType<typeof useUpcomingFilters>;

export const UpcomingFiltersContext = createContext<UpcomingFiltersAPI | null>(
  null,
);

export function useUpcomingFiltersContext(): UpcomingFiltersAPI {
  const ctx = useContext(UpcomingFiltersContext);
  if (!ctx) {
    throw new Error(
      "useUpcomingFiltersContext must be used inside an UpcomingFiltersContext.Provider",
    );
  }
  return ctx;
}
