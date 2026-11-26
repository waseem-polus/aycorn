import { useRef, useSyncExternalStore } from "react";
import { useHotkey } from "@tanstack/react-hotkeys";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
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
import { EntitySearchResults } from "@/features/command-palette/entity-search/entity-search-results";
import {
  entityScopes,
  parseScopeToken,
  type EntityKind,
} from "@/features/command-palette/entity-search/entity-scopes";
import { PaletteChip } from "@/features/command-palette/command-palette/palette-chip";

/**
 * The query decides the mode: a leading ":" means commands. The
 * ":" stays in the query but not in the input, which shows a "Commands" chip.
 */
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
  scope,
  onScopeChange,
  registry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (query: string) => void;
  /** The nested pages entered, outermost first (e.g. ["Create project"]). */
  pages: PaletteCommand[];
  onPagesChange: (pages: PaletteCommand[]) => void;
  /** Search narrowed to one kind of entity, shown as a chip. */
  scope: EntityKind | null;
  onScopeChange: (scope: EntityKind | null) => void;
  registry: CommandRegistry;
}) {
  const sources = useSyncExternalStore(registry.subscribe, registry.getSnapshot);
  const { recentIds, recordRecent } = useRecentCommands();
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRun = useRef<(() => void) | null>(null);

  const currentPage = pages.at(-1);
  // Inside a nested page, or with a scope chip, the whole input is the search.
  const { mode, search } = currentPage
    ? { mode: "commands" as const, search: query.trim() }
    : scope
      ? { mode: "search" as const, search: query.trim() }
      : parseQuery(query);

  const isCommandMode = !currentPage && mode === "commands";
  const inputValue = isCommandMode ? query.slice(commandPrefix.length) : query;

  // A leading scope token ("t ") becomes a chip and leaves the input, and so
  // does a leading ":" (it's in the query, which hides it from the input).
  const handleQueryChange = (value: string) => {
    if (isCommandMode) {
      onQueryChange(commandPrefix + value);
      return;
    }
    const scoped = !currentPage && !scope ? parseScopeToken(value) : null;
    if (scoped) {
      onScopeChange(scoped.scope);
      onQueryChange(scoped.rest);
      return;
    }
    onQueryChange(value);
  };
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
    runAfterClose(command.run);
  };

  const runAfterClose = (run: () => void) => {
    pendingRun.current = run;
    onOpenChange(false);
  };

  // The dialog's default autofocus selects the input's text, so typing would
  // replace it. Put the caret at the end instead.
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

  const leaveCommandMode = () => onQueryChange("");

  const removeChip = () => {
    if (currentPage) goBack();
    else if (scope) onScopeChange(null);
    else leaveCommandMode();
  };

  useHotkey("Backspace", removeChip, {
    target: inputRef,
    enabled:
      open && (!!currentPage || !!scope || isCommandMode) && inputValue === "",
    ignoreInputs: false,
  });

  const chip = scope ? (
    <PaletteChip
      label={entityScopes[scope].label}
      removeLabel={`Search everything, not just ${entityScopes[scope].label.toLowerCase()}`}
      onRemove={() => {
        onScopeChange(null);
        inputRef.current?.focus();
      }}
    />
  ) : isCommandMode ? (
    <PaletteChip
      label="Commands"
      removeLabel="Search instead of commands"
      onRemove={() => {
        leaveCommandMode();
        inputRef.current?.focus();
      }}
    />
  ) : null;

  const placeholder = currentPage
    ? (currentPage.placeholder ?? "Choose…")
    : scope
      ? entityScopes[scope].placeholder
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
        value={inputValue}
        onValueChange={handleQueryChange}
        placeholder={placeholder}
        adornment={chip}
      />
      <CommandList className="max-h-[min(420px,60vh)]">
        {mode === "search" ? (
          <EntitySearchResults
            search={search}
            scope={scope}
            onRun={runAfterClose}
          />
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
