import { defaultFilter } from "cmdk";
import type {
  CommandSource,
  PaletteCommand,
} from "@/features/command-palette/command-types";

export type CommandSection = {
  heading: string;
  commands: PaletteCommand[];
};

const RECENT_SHOWN = 5;

/** Overlay commands first, then context, then global, each source's commands in registration order. Ids are unique. */
const orderedCommands = (sources: CommandSource[]) => {
  const seen = new Set<string>();
  const ordered: PaletteCommand[] = [];
  const scopes = ["overlay", "context", "global"] as const;
  scopes.forEach((scope) =>
    sources
      .filter((source) => source.scope === scope)
      .flatMap((source) => source.commands)
      .forEach((command) => {
        if (seen.has(command.id)) return;
        seen.add(command.id);
        ordered.push(command);
      }),
  );
  return ordered;
};

const groupByHeading = (commands: PaletteCommand[]) => {
  const sections = new Map<string, PaletteCommand[]>();
  commands.forEach((command) => {
    const section = sections.get(command.group) ?? [];
    section.push(command);
    sections.set(command.group, section);
  });
  return [...sections].map(([heading, commands]) => ({ heading, commands }));
};

/**
 * Decides what the command mode lists.
 *
 * - No search: "Recently used", then the current page's groups, then global groups.
 * - Searching: one flat list ranked by match score (ties keep the order above),
 *   since group headings get in the way once you're typing.
 */
export const buildCommandSections = (
  sources: CommandSource[],
  recentIds: string[],
  search: string,
): CommandSection[] => {
  const commands = orderedCommands(sources);

  if (!search) {
    const byId = new Map(commands.map((command) => [command.id, command]));
    const recent = recentIds
      .map((id) => byId.get(id))
      .filter((command): command is PaletteCommand => !!command)
      .slice(0, RECENT_SHOWN);
    const recentSet = new Set(recent);
    const rest = groupByHeading(commands.filter((command) => !recentSet.has(command)));
    return recent.length
      ? [{ heading: "Recently used", commands: recent }, ...rest]
      : rest;
  }

  const ranked = rankCommands(commands, search);
  return ranked.length ? [{ heading: "Commands", commands: ranked }] : [];
};

/** A nested page lists its items by group, or ranked when searching. No recents. */
export const buildPageSections = (
  items: PaletteCommand[],
  search: string,
): CommandSection[] => {
  if (!search) return groupByHeading(items);
  const ranked = rankCommands(items, search);
  return ranked.length ? [{ heading: "Results", commands: ranked }] : [];
};

/** Matching commands, best match first; ties keep their given order. */
const rankCommands = (commands: PaletteCommand[], search: string) =>
  commands
    .map((command, index) => ({
      command,
      index,
      score: defaultFilter(command.title, search, [
        command.group,
        ...(command.keywords ?? []),
      ]),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.command);
