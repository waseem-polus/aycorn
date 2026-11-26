import { useRef, useSyncExternalStore } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  buildCommandSections,
  buildPageSections,
} from "@/features/command-palette/build-command-sections";
import { commandPrefix } from "@/features/command-palette/command-palette-context";
import type { CommandRegistry } from "@/features/command-palette/command-registry";
import type {
  PaletteCommand,
  PaletteMode,
} from "@/features/command-palette/command-types";
import { PaletteCommandItem } from "@/features/command-palette/command-palette/palette-command-item";
import { useRecentCommands } from "@/features/command-palette/hooks/useRecentCommands";

/** The input's text decides the mode: a leading ">" means commands, like VS Code. */
const parseQuery = (query: string): { mode: PaletteMode; search: string } =>
  query.startsWith(commandPrefix)
    ? { mode: "commands", search: query.slice(commandPrefix.length).trim() }
    : { mode: "search", search: query.trim() };

export function CommandPalette({
  open,
  onOpenChange,
  query,
  onQueryChange,
  pages,
  onPagesChange,
  registry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** The nested pages entered, outermost first (e.g. ["Create project"]). */
  pages: PaletteCommand[];
  onPagesChange: (pages: PaletteCommand[]) => void;
  registry: CommandRegistry;
}) {
  const sources = useSyncExternalStore(registry.subscribe, registry.getSnapshot);
  const { recentIds, recordRecent } = useRecentCommands();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRun = useRef<(() => void) | null>(null);

  const currentPage = pages.at(-1);
  // Inside a nested page the whole input is the search; there's no prefix.
  const { mode, search } = currentPage
    ? { mode: "commands" as const, search: query.trim() }
    : parseQuery(query);
  const sections = currentPage?.items
    ? buildPageSections(currentPage.items, search)
    : mode === "commands"
      ? buildCommandSections(sources, recentIds, search)
      : [];

  const selectCommand = (command: PaletteCommand) => {
    if (command.items) {
      onPagesChange([...pages, command]);
      onQueryChange("");
      return;
    }
    // Recents list the top-level command ("Create project"), not the choice made in it.
    recordRecent((pages[0] ?? command).id);
    pendingRun.current = command.run;
    onOpenChange(false);
  };

  // The dialog's default autofocus selects the input's text, so typing would
  // replace the ">" that command mode opens with. Put the caret after it.
  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  };

  // Commands run once the dialog has closed and handed focus back, so a
  // command that focuses something (e.g. "Rename workflow") isn't undone by
  // the dialog's focus trap or its focus restore.
  const handleCloseAutoFocus = () => {
    const run = pendingRun.current;
    pendingRun.current = null;
    if (run) setTimeout(run, 0);
  };

  const goBack = () => {
    const parentPages = pages.slice(0, -1);
    onPagesChange(parentPages);
    onQueryChange(parentPages.length ? "" : commandPrefix);
  };

  useHotkey("Backspace", goBack, {
    target: inputRef,
    enabled: open && !!currentPage && query === "",
    ignoreInputs: false,
  });

  const placeholder = currentPage
    ? (currentPage.placeholder ?? "Choose…")
    : mode === "commands"
      ? "Type a command…"
      : `Search… (type ${commandPrefix} for commands)`;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      contentProps={{
        onOpenAutoFocus: handleOpenAutoFocus,
        onCloseAutoFocus: handleCloseAutoFocus,
      }}
      title={mode === "commands" ? "Command palette" : "Search"}
      description={
        mode === "commands" ? "Search for a command to run" : "Search Aycorn"
      }
      showCloseButton={false}
      className="top-[15%] translate-y-0 sm:max-w-xl"
      commandProps={{ shouldFilter: false, loop: true }}
    >
      {currentPage && (
        <div className="flex items-center gap-1 px-3 pt-2 text-xs text-muted-foreground">
          {pages.map((page) => page.title).join(" › ")}
        </div>
      )}
      <CommandInput
        ref={inputRef}
        value={query}
        onValueChange={onQueryChange}
        placeholder={placeholder}
      />
      <CommandList className="max-h-[min(420px,60vh)]">
        {mode === "search" ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Search isn't available yet. Type <Kbd>{commandPrefix}</Kbd> for
            commands.
          </div>
        ) : (
          <>
            <CommandEmpty>
              {currentPage ? "Nothing to choose from." : "No matching commands."}
            </CommandEmpty>
            {sections.map((section) => (
              <CommandGroup key={section.heading} heading={section.heading}>
                {section.commands.map((command) => (
                  <PaletteCommandItem
                    key={command.id}
                    command={command}
                    showGroup={!!search}
                    onSelect={selectCommand}
                  />
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
