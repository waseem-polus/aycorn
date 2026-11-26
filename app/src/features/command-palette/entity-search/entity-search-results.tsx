import { CommandEmpty, CommandGroup } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { commandPrefix } from "@/features/command-palette/command-palette-context";
import { PaletteCommandItem } from "@/features/command-palette/command-palette/palette-command-item";
import {
  entityKinds,
  entityScopes,
  type EntityKind,
} from "@/features/command-palette/entity-search/entity-scopes";
import { useEntitySearch } from "@/features/command-palette/entity-search/useEntitySearch";
import { useRecentEntities } from "@/features/command-palette/hooks/useRecentEntities";

/** The palette's search mode: entities by title, opened on select. */
export function EntitySearchResults({
  search,
  scope,
  onRun,
}: {
  search: string;
  scope: EntityKind | null;
  /** Runs the chosen entry once the palette has closed. */
  onRun: (run: () => void) => void;
}) {
  const { recentIds, recordRecent } = useRecentEntities();
  const { sections, isLoading } = useEntitySearch({ search, scope, recentIds });

  return (
    <>
      <CommandEmpty>
        {isLoading
          ? "Loading…"
          : search
            ? "No matches."
            : `Type to search ${scope ? entityScopes[scope].label.toLowerCase() : "tasks, projects and workflows"}.`}
      </CommandEmpty>
      {sections.map((section) => (
        <CommandGroup key={section.heading} heading={section.heading}>
          {section.commands.map((entry) => (
            <PaletteCommandItem
              key={entry.id}
              command={entry}
              // Recents mix kinds under one heading, so name each row's kind.
              showGroup={!search}
              onSelect={() => {
                recordRecent(entry.id);
                if (entry.run) onRun(entry.run);
              }}
            />
          ))}
        </CommandGroup>
      ))}
      {!scope && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-3 py-2 text-xs text-muted-foreground">
          {entityKinds.map((kind) => (
            <span key={kind} className="flex items-center gap-1">
              <Kbd>{entityScopes[kind].token}</Kbd>
              {entityScopes[kind].label.toLowerCase()}
            </span>
          ))}
          <span className="flex items-center gap-1">
            <Kbd>{commandPrefix}</Kbd>
            commands
          </span>
        </div>
      )}
    </>
  );
}
