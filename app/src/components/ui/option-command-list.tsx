import { useState } from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type {
  MultiSelectOption,
  MultiSelectOptionGroup,
} from "@/components/ui/multi-select-combobox";
import { cn } from "@/lib/utils";

type Props = {
  options?: MultiSelectOption[];
  groups?: MultiSelectOptionGroup[];
  selected: (string | number)[];
  onSelect: (key: string | number) => void;
  /** Hide the search input for short, fixed lists (e.g. operators). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Rendered under the list, e.g. a "2 selected · Clear" bar. */
  footer?: React.ReactNode;
  className?: string;
  /**
   * The list root. Without a search input nothing inside is focusable, so a
   * non-searchable list must be focused through this ref (e.g. from the
   * popover's onOpenAutoFocus) for arrow keys and Enter to work.
   */
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * The searchable, optionally grouped option list every filter picker shares:
 * the basic filters' multi-select combobox and the condition builder's
 * property, operator and value pickers. The caller owns the popover and the
 * trigger, and decides whether selecting toggles (multi) or closes (single).
 */
export function OptionCommandList({
  options,
  groups,
  selected,
  onSelect,
  searchable = true,
  searchPlaceholder = "Search…",
  footer,
  className,
  ref,
}: Props) {
  const [query, setQuery] = useState("");
  const ql = query.trim().toLowerCase();

  const matches = (o: MultiSelectOption) =>
    !ql ||
    o.label.toLowerCase().includes(ql) ||
    (o.sublabel ?? "").toLowerCase().includes(ql);

  const shownGroups = (groups ?? [{ label: "", options: options ?? [] }])
    .map((g) => ({ ...g, options: g.options.filter(matches) }))
    .filter((g) => g.options.length > 0);

  return (
    <Command
      ref={ref}
      shouldFilter={false}
      // Start the keyboard highlight on the current choice in single-pick lists.
      defaultValue={selected.length === 1 ? String(selected[0]) : undefined}
      tabIndex={searchable ? undefined : -1}
      className={cn("outline-none", className)}
    >
      {searchable && (
        <CommandInput
          placeholder={searchPlaceholder}
          value={query}
          onValueChange={setQuery}
        />
      )}
      <CommandList onWheel={(e) => e.stopPropagation()}>
        <CommandEmpty>No matches.</CommandEmpty>
        {shownGroups.map((g, i) => (
          <OptionGroup
            key={g.label || i}
            group={g}
            separated={i > 0 && !g.label}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </CommandList>
      {footer}
    </Command>
  );
}

function OptionGroup({
  group,
  separated,
  selected,
  onSelect,
}: {
  group: MultiSelectOptionGroup;
  /** Unlabelled groups after the first are set apart with a separator instead of a heading. */
  separated: boolean;
  selected: (string | number)[];
  onSelect: (key: string | number) => void;
}) {
  return (
    <>
      {separated && <CommandSeparator />}
      <CommandGroup heading={group.label || undefined}>
        {group.options.map((o) => (
          <CommandItem
            key={o.key}
            value={String(o.key)}
            onSelect={() => onSelect(o.key)}
            className={cn(o.description && "items-start")}
          >
            <Check
              className={cn(
                "size-4 shrink-0",
                o.description && "mt-0.5",
                selected.includes(o.key) ? "opacity-100" : "opacity-0",
              )}
            />
            {o.lead}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{o.label}</span>
              {o.description && (
                <span className="text-xs text-muted-foreground">
                  {o.description}
                </span>
              )}
            </span>
            {o.sublabel && (
              <span className="text-xs text-muted-foreground shrink-0">
                {o.sublabel}
              </span>
            )}
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}
