import type { FilterDefinition } from "@/features/saved-filters/filter-definition";

/** A page with views: /upcoming, or one project. */
export type Board = { surface: "upcoming" } | { surface: "project"; projectId: number };

/**
 * A filter's place on one view's bar. The view's board and name come along so
 * a pin can be placed on its board without loading that board's views.
 */
export type SavedFilterPin = {
  ViewID: number;
  ViewName: string;
  Surface: Board["surface"];
  ProjectID: number | null;
  Position: number;
};

/**
 * A named, reusable filter. Cosmetic fields (color, icon, description) are
 * meant to arrive as optional fields here, on `SavedFilterPatch`, and in
 * `SavedFilterLabel` — nothing else needs to change.
 */
export type SavedFilter = {
  ID: number;
  Name: string;
  Definition: FilterDefinition;
  Pins: SavedFilterPin[];
  TimeCreated: string;
  TimeModified: string;
};

export type SavedFilterPatch = Partial<{ name: string; definition: FilterDefinition }>;
