import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/features/color-picker/color-picker";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ViewIcon } from "@/features/views/view-icon";
import type { BoardView, ViewPatch } from "@/features/views/view-types";

type Props = {
  view: BoardView;
  onUpdate: (patch: ViewPatch) => void;
};

/** Focuses the first enabled row of the menu `from` sits in. */
const focusFirstRow = (from: HTMLElement) =>
  from
    .closest<HTMLElement>('[role="menu"]')
    ?.querySelector<HTMLElement>('[role="menuitem"]:not([data-disabled])')
    ?.focus();

/**
 * The menu's top row: the view's icon (opens the icon and color picker) and
 * its name, edited in place. The name saves on blur and when the menu closes.
 *
 * A menu doesn't roving-focus its non-item children, so the arrow keys are
 * wired by hand: ← / → switch between the icon and the name, ↓ drops into
 * the rows below.
 */
export function ViewMenuHeader({ view, onUpdate }: Props) {
  const [name, setName] = useState(view.Name);
  const draft = useRef(view.Name);
  const committed = useRef(view.Name);
  const latestUpdate = useRef(onUpdate);
  useEffect(() => {
    latestUpdate.current = onUpdate;
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iconRef = useRef<HTMLButtonElement | null>(null);

  const commit = () => {
    const trimmed = draft.current.trim();
    if (!trimmed || trimmed === committed.current) return;
    committed.current = trimmed;
    latestUpdate.current({ name: trimmed });
  };

  // Closing the menu unmounts this, which saves a name still being typed.
  useEffect(() => commit, []);

  return (
    <div className="flex items-center gap-1.5 p-1">
      <IconPickerPopover
        value={view.Icon}
        onSelect={(icon) => onUpdate({ icon })}
        headerSlot={
          <ColorPicker
            value={view.Color}
            onSelect={(color) => onUpdate({ color })}
            align="end"
          />
        }
        align="start"
        side="bottom"
        trigger={
          <Button
            ref={iconRef}
            variant="outline"
            size="icon"
            className="size-8 shrink-0"
            aria-label="Change icon"
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                inputRef.current?.focus();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                focusFirstRow(e.currentTarget);
              }
            }}
          >
            <ViewIcon view={view} />
          </Button>
        }
      />
      <Input
        ref={inputRef}
        value={name}
        aria-label="View name"
        className="h-8 min-w-0 flex-1"
        onChange={(e) => {
          setName(e.target.value);
          draft.current = e.target.value;
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          // Typing must not reach the menu's type-ahead.
          e.stopPropagation();
          const input = e.currentTarget;
          if (e.key === "ArrowDown" || e.key === "Enter") {
            e.preventDefault();
            commit();
            focusFirstRow(input);
          } else if (
            e.key === "ArrowLeft" &&
            input.selectionStart === 0 &&
            input.selectionEnd === 0
          ) {
            e.preventDefault();
            iconRef.current?.focus();
          }
        }}
      />
    </div>
  );
}
