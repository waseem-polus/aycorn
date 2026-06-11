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
  progress: string; // muted fill — SegmentedProgress bars
  stroke: string; // icon stroke — StageIcon, stage-row icon
  tint: string; // subtle bg — kanban column, WorkflowStageChip
  badge: string; // bg + text — StageTypeBadge
  bullet: string; // solid dot — calendar EventBullet
  calendarBadge: string; // border + bg + text — calendar MonthEventBadge (solid mode)
  calendarDot: string; // svg fill — calendar MonthEventBadge (dot mode)
  calendarCell: string; // bg + hover — EventListDialog colored row
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
    progress: "bg-neutral-400 dark:bg-neutral-400/70",
    stroke: "stroke-neutral-500 dark:stroke-neutral-400",
    tint: "bg-accent",
    badge:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    bullet: "bg-neutral-600 dark:bg-neutral-500",
    calendarBadge:
      "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
    calendarDot: "[&_svg]:fill-neutral-600",
    calendarCell:
      "bg-neutral-600 dark:bg-neutral-500 hover:bg-neutral-700 dark:hover:bg-neutral-400",
  },
  slate: {
    swatch: "bg-slate-500 dark:bg-slate-400",
    progress: "bg-slate-400 dark:bg-slate-400/70",
    stroke: "stroke-slate-500 dark:stroke-slate-400",
    tint: "bg-slate-50 dark:bg-slate-950/40",
    badge: "bg-slate-50 text-slate-800 dark:bg-slate-950/40 dark:text-slate-200",
    bullet: "bg-slate-600 dark:bg-slate-500",
    calendarBadge:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
    calendarDot: "[&_svg]:fill-slate-600",
    calendarCell:
      "bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-400",
  },
  red: {
    swatch: "bg-red-500 dark:bg-red-400",
    progress: "bg-red-400 dark:bg-red-400/70",
    stroke: "stroke-red-500 dark:stroke-red-400",
    tint: "bg-red-50 dark:bg-red-950/40",
    badge: "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200",
    bullet: "bg-red-600 dark:bg-red-500",
    calendarBadge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    calendarDot: "[&_svg]:fill-red-600",
    calendarCell:
      "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400",
  },
  rose: {
    swatch: "bg-rose-500 dark:bg-rose-400",
    progress: "bg-rose-400 dark:bg-rose-400/70",
    stroke: "stroke-rose-500 dark:stroke-rose-400",
    tint: "bg-rose-50 dark:bg-rose-950/40",
    badge: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200",
    bullet: "bg-rose-600 dark:bg-rose-500",
    calendarBadge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
    calendarDot: "[&_svg]:fill-rose-600",
    calendarCell:
      "bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 dark:hover:bg-rose-400",
  },
  orange: {
    swatch: "bg-orange-500 dark:bg-orange-400",
    progress: "bg-orange-400 dark:bg-orange-400/70",
    stroke: "stroke-orange-500 dark:stroke-orange-400",
    tint: "bg-orange-50 dark:bg-orange-950/40",
    badge:
      "bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
    bullet: "bg-orange-600 dark:bg-orange-500",
    calendarBadge:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
    calendarDot: "[&_svg]:fill-orange-600",
    calendarCell:
      "bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-400",
  },
  amber: {
    swatch: "bg-amber-500 dark:bg-amber-400",
    progress: "bg-amber-400 dark:bg-amber-400/70",
    stroke: "stroke-amber-500 dark:stroke-amber-400",
    tint: "bg-amber-50 dark:bg-amber-950/40",
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
    bullet: "bg-amber-600 dark:bg-amber-500",
    calendarBadge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
    calendarDot: "[&_svg]:fill-amber-600",
    calendarCell:
      "bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400",
  },
  yellow: {
    swatch: "bg-yellow-500 dark:bg-yellow-400",
    progress: "bg-yellow-400 dark:bg-yellow-400/70",
    stroke: "stroke-yellow-500 dark:stroke-yellow-400",
    tint: "bg-yellow-50 dark:bg-yellow-950/40",
    badge:
      "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200",
    bullet: "bg-yellow-600 dark:bg-yellow-500",
    calendarBadge:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    calendarDot: "[&_svg]:fill-yellow-600",
    calendarCell:
      "bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-400",
  },
  lime: {
    swatch: "bg-lime-500 dark:bg-lime-400",
    progress: "bg-lime-400 dark:bg-lime-400/70",
    stroke: "stroke-lime-500 dark:stroke-lime-400",
    tint: "bg-lime-50 dark:bg-lime-950/40",
    badge: "bg-lime-50 text-lime-800 dark:bg-lime-950/40 dark:text-lime-200",
    bullet: "bg-lime-600 dark:bg-lime-500",
    calendarBadge:
      "border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-950 dark:text-lime-300",
    calendarDot: "[&_svg]:fill-lime-600",
    calendarCell:
      "bg-lime-600 dark:bg-lime-500 hover:bg-lime-700 dark:hover:bg-lime-400",
  },
  green: {
    swatch: "bg-green-500 dark:bg-green-400",
    progress: "bg-green-400 dark:bg-green-400/70",
    stroke: "stroke-green-500 dark:stroke-green-400",
    tint: "bg-green-50 dark:bg-green-950/40",
    badge: "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200",
    bullet: "bg-green-600 dark:bg-green-500",
    calendarBadge:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    calendarDot: "[&_svg]:fill-green-600",
    calendarCell:
      "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400",
  },
  emerald: {
    swatch: "bg-emerald-500 dark:bg-emerald-400",
    progress: "bg-emerald-400 dark:bg-emerald-400/70",
    stroke: "stroke-emerald-500 dark:stroke-emerald-400",
    tint: "bg-emerald-50 dark:bg-emerald-950/40",
    badge:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
    bullet: "bg-emerald-600 dark:bg-emerald-500",
    calendarBadge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    calendarDot: "[&_svg]:fill-emerald-600",
    calendarCell:
      "bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400",
  },
  teal: {
    swatch: "bg-teal-500 dark:bg-teal-400",
    progress: "bg-teal-400 dark:bg-teal-400/70",
    stroke: "stroke-teal-500 dark:stroke-teal-400",
    tint: "bg-teal-50 dark:bg-teal-950/40",
    badge: "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200",
    bullet: "bg-teal-600 dark:bg-teal-500",
    calendarBadge:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
    calendarDot: "[&_svg]:fill-teal-600",
    calendarCell:
      "bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-400",
  },
  cyan: {
    swatch: "bg-cyan-500 dark:bg-cyan-400",
    progress: "bg-cyan-400 dark:bg-cyan-400/70",
    stroke: "stroke-cyan-500 dark:stroke-cyan-400",
    tint: "bg-cyan-50 dark:bg-cyan-950/40",
    badge: "bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
    bullet: "bg-cyan-600 dark:bg-cyan-500",
    calendarBadge:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
    calendarDot: "[&_svg]:fill-cyan-600",
    calendarCell:
      "bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-700 dark:hover:bg-cyan-400",
  },
  sky: {
    swatch: "bg-sky-500 dark:bg-sky-400",
    progress: "bg-sky-400 dark:bg-sky-400/70",
    stroke: "stroke-sky-500 dark:stroke-sky-400",
    tint: "bg-sky-50 dark:bg-sky-950/40",
    badge: "bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
    bullet: "bg-sky-600 dark:bg-sky-500",
    calendarBadge:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
    calendarDot: "[&_svg]:fill-sky-600",
    calendarCell:
      "bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-400",
  },
  blue: {
    swatch: "bg-blue-500 dark:bg-blue-400",
    progress: "bg-blue-400 dark:bg-blue-400/70",
    stroke: "stroke-blue-500 dark:stroke-blue-400",
    tint: "bg-blue-50 dark:bg-blue-950/40",
    badge: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
    bullet: "bg-blue-600 dark:bg-blue-500",
    calendarBadge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
    calendarDot: "[&_svg]:fill-blue-600",
    calendarCell:
      "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400",
  },
  indigo: {
    swatch: "bg-indigo-500 dark:bg-indigo-400",
    progress: "bg-indigo-400 dark:bg-indigo-400/70",
    stroke: "stroke-indigo-500 dark:stroke-indigo-400",
    tint: "bg-indigo-50 dark:bg-indigo-950/40",
    badge:
      "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
    bullet: "bg-indigo-600 dark:bg-indigo-500",
    calendarBadge:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    calendarDot: "[&_svg]:fill-indigo-600",
    calendarCell:
      "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400",
  },
  violet: {
    swatch: "bg-violet-500 dark:bg-violet-400",
    progress: "bg-violet-400 dark:bg-violet-400/70",
    stroke: "stroke-violet-500 dark:stroke-violet-400",
    tint: "bg-violet-50 dark:bg-violet-950/40",
    badge:
      "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
    bullet: "bg-violet-600 dark:bg-violet-500",
    calendarBadge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
    calendarDot: "[&_svg]:fill-violet-600",
    calendarCell:
      "bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-400",
  },
  purple: {
    swatch: "bg-purple-500 dark:bg-purple-400",
    progress: "bg-purple-400 dark:bg-purple-400/70",
    stroke: "stroke-purple-500 dark:stroke-purple-400",
    tint: "bg-purple-50 dark:bg-purple-950/40",
    badge:
      "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-200",
    bullet: "bg-purple-600 dark:bg-purple-500",
    calendarBadge:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
    calendarDot: "[&_svg]:fill-purple-600",
    calendarCell:
      "bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400",
  },
  fuchsia: {
    swatch: "bg-fuchsia-500 dark:bg-fuchsia-400",
    progress: "bg-fuchsia-400 dark:bg-fuchsia-400/70",
    stroke: "stroke-fuchsia-500 dark:stroke-fuchsia-400",
    tint: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    badge:
      "bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-950/40 dark:text-fuchsia-200",
    bullet: "bg-fuchsia-600 dark:bg-fuchsia-500",
    calendarBadge:
      "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
    calendarDot: "[&_svg]:fill-fuchsia-600",
    calendarCell:
      "bg-fuchsia-600 dark:bg-fuchsia-500 hover:bg-fuchsia-700 dark:hover:bg-fuchsia-400",
  },
  pink: {
    swatch: "bg-pink-500 dark:bg-pink-400",
    progress: "bg-pink-400 dark:bg-pink-400/70",
    stroke: "stroke-pink-500 dark:stroke-pink-400",
    tint: "bg-pink-50 dark:bg-pink-950/40",
    badge: "bg-pink-50 text-pink-800 dark:bg-pink-950/40 dark:text-pink-200",
    bullet: "bg-pink-600 dark:bg-pink-500",
    calendarBadge:
      "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
    calendarDot: "[&_svg]:fill-pink-600",
    calendarCell:
      "bg-pink-600 dark:bg-pink-500 hover:bg-pink-700 dark:hover:bg-pink-400",
  },
};

const facets = (color: string): StageColorFacets =>
  STAGE_PALETTE[color as StageColor] ?? STAGE_PALETTE.gray;

export const stageSwatchClass = (color: string) => facets(color).swatch;
export const stageProgressClass = (color: string) => facets(color).progress;
export const stageStrokeClass = (color: string) => facets(color).stroke;
export const stageTintClass = (color: string) => facets(color).tint;
export const stageBadgeClass = (color: string) => facets(color).badge;
export const stageBulletClass = (color: string) => facets(color).bullet;
export const stageCalendarBadgeClass = (color: string) =>
  facets(color).calendarBadge;
export const stageCalendarDotClass = (color: string) =>
  facets(color).calendarDot;
export const stageCalendarCellClass = (color: string) =>
  facets(color).calendarCell;
