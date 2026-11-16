import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutPreview } from "@/features/views/layout-selector/layout-preview";
import { VIEW_TYPES } from "@/features/views/view-groupings";
import type { ViewType } from "@/features/views/view-types";

type Props = {
  value: ViewType;
  onChange: (type: ViewType) => void;
  className?: string;
};

/** Pick a view's layout from small illustrated cards (mirrors the theme selector). */
export function LayoutSelector({ value, onChange, className }: Props) {
  // Arrow keys move focus between the cards (Enter / Space picks).
  const moveFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0) return;
    const cards = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    );
    const at = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    cards[(at + delta + cards.length) % cards.length]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Layout"
      onKeyDown={moveFocus}
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}
    >
      {VIEW_TYPES.map((t) => {
        const selected = value === t.type;
        return (
          <button
            key={t.type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(t.type)}
            className={cn(
              "flex cursor-pointer flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-colors hover:bg-accent/30",
              selected ? "border-primary ring-2 ring-primary/30" : "border-border",
            )}
          >
            <LayoutPreview type={t.type} selected={selected} />
            <span className="flex items-center gap-1.5 px-0.5 text-sm font-medium">
              <DynamicIcon name={t.icon as IconName} className="size-4" />
              {t.label}
              {selected && <CheckIcon className="ml-auto size-4 text-primary" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
