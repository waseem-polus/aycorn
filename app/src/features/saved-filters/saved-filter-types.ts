import type { FilterDefinition } from "@/features/saved-filters/filter-definition";

/**
 * A place a filter can be pinned as a quick filter. Future surfaces (views,
 * widgets) join this union — and the server's surface check — with no table
 * change.
 */
export type Board = { surface: "upcoming" } | { surface: "project"; projectId: number };

export type SavedFilterPin = {
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
