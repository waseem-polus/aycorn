import type { ComponentType, ReactElement } from "react";
import type { Hotkey } from "@tanstack/hotkeys";

type PaletteCommandBase = {
  /** Stable, namespaced id (e.g. "project.archive"). Recently-used tracking keys on it. */
  id: string;
  title: string;
  /** Section heading the command is listed under (e.g. "Navigation"). */
  group: string;
  /** A lucide-style component, or a ready element for icons that need props (e.g. a stage's colored icon). */
  icon?: ComponentType<{ className?: string }> | ReactElement;
  /** Extra words that should match in search but aren't shown. */
  keywords?: string[];
  /** Short muted text shown at the end of the row (e.g. "Dark → System"). */
  hint?: string;
  /** The command's own shortcut, shown as a hint. The binding lives where the feature is. */
  hotkey?: Hotkey;
};

/**
 * One entry in the command palette. It either runs (a leaf), or opens a nested
 * page listing `items` to choose from, e.g. "Create project" → pick a workflow.
 * Backspace on an empty input goes back a page.
 */
export type PaletteCommand = PaletteCommandBase &
  (
    | { run: () => void; items?: never; placeholder?: never }
    | {
        items: PaletteCommand[];
        /** Input placeholder on the nested page (e.g. "Choose a workflow…"). */
        placeholder?: string;
        run?: never;
      }
  );

/**
 * Where a registered set of commands sorts:
 * - "overlay": a surface layered over the page, like the task drawer. Listed
 *   first, since it's what the user is looking at.
 * - "context": the page currently mounted.
 * - "global": always available.
 */
export type CommandScope = "global" | "context" | "overlay";

export type CommandSource = {
  scope: CommandScope;
  commands: PaletteCommand[];
};

/** "commands" is entered by typing the ">" prefix; anything else is entity search. */
export type PaletteMode = "search" | "commands";
