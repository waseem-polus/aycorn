// Single source of truth for stage colors.
//
// Tailwind only generates classes that appear verbatim in source, so every
// class string below must be written literally — no template interpolation.
//
// COUPLING: the set of color names here mirrors the Go allowed-colors set in
// server/internal/models/stagecolor.go. Adding/removing a color requires
// editing both lists (kept deliberately migration-free — see CLAUDE.md).

type StageColorFacets = {
  swatch: string; // solid fill — picker grid + StageColorSquare
  stroke: string; // icon stroke — StageIcon, stage-row icon
  tint: string; // subtle bg — kanban column, WorkflowStageChip
  badge: string; // bg + text — StageTypeBadge
};

export const STAGE_COLORS = [
  "gray",
  "slate",
  "red",
  "rose",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
] as const;

export type StageColor = (typeof STAGE_COLORS)[number];

export const STAGE_PALETTE: Record<StageColor, StageColorFacets> = {
  gray: {
    swatch: "bg-neutral-500 dark:bg-neutral-400",
    stroke: "stroke-neutral-500 dark:stroke-neutral-400",
    tint: "bg-accent",
    badge:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  },
  slate: {
    swatch: "bg-slate-500 dark:bg-slate-400",
    stroke: "stroke-slate-500 dark:stroke-slate-400",
    tint: "bg-slate-50 dark:bg-slate-950/40",
    badge: "bg-slate-50 text-slate-800 dark:bg-slate-950/40 dark:text-slate-200",
  },
  red: {
    swatch: "bg-red-500 dark:bg-red-400",
    stroke: "stroke-red-500 dark:stroke-red-400",
    tint: "bg-red-50 dark:bg-red-950/40",
    badge: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200",
  },
  rose: {
    swatch: "bg-rose-500 dark:bg-rose-400",
    stroke: "stroke-rose-500 dark:stroke-rose-400",
    tint: "bg-rose-50 dark:bg-rose-950/40",
    badge: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
  },
  orange: {
    swatch: "bg-orange-500 dark:bg-orange-400",
    stroke: "stroke-orange-500 dark:stroke-orange-400",
    tint: "bg-orange-50 dark:bg-orange-950/40",
    badge:
      "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  },
  amber: {
    swatch: "bg-amber-500 dark:bg-amber-400",
    stroke: "stroke-amber-500 dark:stroke-amber-400",
    tint: "bg-amber-50 dark:bg-amber-950/40",
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
  yellow: {
    swatch: "bg-yellow-500 dark:bg-yellow-400",
    stroke: "stroke-yellow-500 dark:stroke-yellow-400",
    tint: "bg-yellow-50 dark:bg-yellow-950/40",
    badge:
      "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200",
  },
  lime: {
    swatch: "bg-lime-500 dark:bg-lime-400",
    stroke: "stroke-lime-500 dark:stroke-lime-400",
    tint: "bg-lime-50 dark:bg-lime-950/40",
    badge: "bg-lime-50 text-lime-800 dark:bg-lime-950/40 dark:text-lime-200",
  },
  green: {
    swatch: "bg-green-500 dark:bg-green-400",
    stroke: "stroke-green-500 dark:stroke-green-400",
    tint: "bg-green-50 dark:bg-green-950/40",
    badge: "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200",
  },
  emerald: {
    swatch: "bg-emerald-500 dark:bg-emerald-400",
    stroke: "stroke-emerald-500 dark:stroke-emerald-400",
    tint: "bg-emerald-50 dark:bg-emerald-950/40",
    badge:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
  teal: {
    swatch: "bg-teal-500 dark:bg-teal-400",
    stroke: "stroke-teal-500 dark:stroke-teal-400",
    tint: "bg-teal-50 dark:bg-teal-950/40",
    badge: "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
  },
  cyan: {
    swatch: "bg-cyan-500 dark:bg-cyan-400",
    stroke: "stroke-cyan-500 dark:stroke-cyan-400",
    tint: "bg-cyan-50 dark:bg-cyan-950/40",
    badge: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  },
  sky: {
    swatch: "bg-sky-500 dark:bg-sky-400",
    stroke: "stroke-sky-500 dark:stroke-sky-400",
    tint: "bg-sky-50 dark:bg-sky-950/40",
    badge: "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
  },
  blue: {
    swatch: "bg-blue-500 dark:bg-blue-400",
    stroke: "stroke-blue-500 dark:stroke-blue-400",
    tint: "bg-blue-50 dark:bg-blue-950/40",
    badge: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  },
  indigo: {
    swatch: "bg-indigo-500 dark:bg-indigo-400",
    stroke: "stroke-indigo-500 dark:stroke-indigo-400",
    tint: "bg-indigo-50 dark:bg-indigo-950/40",
    badge:
      "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
  },
  violet: {
    swatch: "bg-violet-500 dark:bg-violet-400",
    stroke: "stroke-violet-500 dark:stroke-violet-400",
    tint: "bg-violet-50 dark:bg-violet-950/40",
    badge:
      "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
  },
  purple: {
    swatch: "bg-purple-500 dark:bg-purple-400",
    stroke: "stroke-purple-500 dark:stroke-purple-400",
    tint: "bg-purple-50 dark:bg-purple-950/40",
    badge:
      "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200",
  },
  fuchsia: {
    swatch: "bg-fuchsia-500 dark:bg-fuchsia-400",
    stroke: "stroke-fuchsia-500 dark:stroke-fuchsia-400",
    tint: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    badge:
      "bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-200",
  },
  pink: {
    swatch: "bg-pink-500 dark:bg-pink-400",
    stroke: "stroke-pink-500 dark:stroke-pink-400",
    tint: "bg-pink-50 dark:bg-pink-950/40",
    badge: "bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200",
  },
};

const facets = (color: string): StageColorFacets =>
  STAGE_PALETTE[color as StageColor] ?? STAGE_PALETTE.gray;

export const stageSwatchClass = (color: string) => facets(color).swatch;
export const stageStrokeClass = (color: string) => facets(color).stroke;
export const stageTintClass = (color: string) => facets(color).tint;
export const stageBadgeClass = (color: string) => facets(color).badge;
