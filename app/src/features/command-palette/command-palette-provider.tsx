import { useState, type ReactNode } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";
import { CommandPalette } from "@/features/command-palette/command-palette";
import {
  CommandPaletteContext,
  commandPaletteHotkey,
  commandPrefix,
  searchPaletteHotkey,
} from "@/features/command-palette/command-palette-context";
import { createCommandRegistry } from "@/features/command-palette/command-registry";
import type { EntityKind } from "@/features/command-palette/entity-search/entity-scopes";
import type {
  PaletteCommand,
  PaletteMode,
} from "@/features/command-palette/command-types";

const isInRichTextEditor = (target: EventTarget | null) =>
  target instanceof Element && !!target.closest("[data-slate-editor]");

/** Owns the palette's open state and the command registry; mount once at the app root. */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(createCommandRegistry);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<PaletteCommand[]>([]);
  const [scope, setScope] = useState<EntityKind | null>(null);

  const openPalette = (mode: PaletteMode) => {
    setQuery(mode === "commands" ? commandPrefix : "");
    setPages([]);
    setScope(null);
    setOpen(true);
  };

  useHotkeys([
    { hotkey: searchPaletteHotkey, callback: () => openPalette("search") },
    {
      hotkey: commandPaletteHotkey,
      // The rich-text editor binds Mod+K to "insert link" with its own
      // document-level listener, so ordering can't decide who wins. Step aside
      // inside the editor, and only claim the key (preventDefault) elsewhere.
      callback: (event) => {
        if (isInRichTextEditor(event.target)) return;
        event.preventDefault();
        openPalette("commands");
      },
      options: { preventDefault: false, stopPropagation: false },
    },
  ]);

  return (
    <CommandPaletteContext.Provider value={{ registry, openPalette }}>
      {children}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        query={query}
        onQueryChange={setQuery}
        pages={pages}
        onPagesChange={setPages}
        scope={scope}
        onScopeChange={setScope}
        registry={registry}
      />
    </CommandPaletteContext.Provider>
  );
}
