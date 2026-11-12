import type { ViewType } from "@/features/views/view-types";

type Props = {
  type: ViewType;
  /** Only the selected layout gets the accent color. */
  selected: boolean;
};

const bar = "rounded-sm bg-muted-foreground/25";

/** A tiny schematic of each layout, drawn with semantic tokens so it follows the theme. */
export function LayoutPreview({ type, selected }: Props) {
  const accent = selected ? "bg-primary" : "bg-muted-foreground/50";
  return (
    <div
      aria-hidden
      className="h-20 w-full overflow-hidden rounded-md border bg-background p-2"
    >
      {type === "list" && <ListPreview accent={accent} />}
      {type === "board" && <BoardPreview accent={accent} />}
      {type === "month" && <MonthPreview accent={accent} />}
      {type === "week" && <WeekPreview accent={accent} />}
    </div>
  );
}

const LIST_TITLE_WIDTHS = ["w-4/5", "w-3/5", "w-[70%]"];

function ListPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col justify-between">
      {LIST_TITLE_WIDTHS.map((width, row) => (
        <div key={row} className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
          <div className="flex flex-1 flex-col gap-0.5">
            <div className={`h-1.5 rounded-full ${width} ${accent}`} />
            <div className={`h-1 w-2/5 ${bar} opacity-60`} />
          </div>
          <div className={`h-2 w-6 ${bar}`} />
        </div>
      ))}
    </div>
  );
}

function BoardPreview({ accent }: { accent: string }) {
  return (
    <div className="grid h-full grid-cols-3 gap-1.5">
      {[2, 1, 2].map((cards, col) => (
        <div key={col} className="flex flex-col gap-1">
          <div className={`h-1 w-3/4 rounded-full ${accent}`} />
          {Array.from({ length: cards }).map((_, card) => (
            <div key={card} className={`h-3.5 ${bar}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

const HIGHLIGHTED_DAYS = new Set([9, 17, 18]);

function MonthPreview({ accent }: { accent: string }) {
  return (
    <div className="grid h-full grid-cols-7 grid-rows-4 gap-0.5">
      {Array.from({ length: 28 }).map((_, day) => (
        <div
          key={day}
          className={`rounded-[2px] ${
            HIGHLIGHTED_DAYS.has(day) ? `${accent} opacity-70` : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

const WEEK_EVENTS: (string | null)[] = [
  "top-1 h-3",
  "top-5 h-4",
  "top-2 h-3",
  "top-6 h-4",
  null,
];

function WeekPreview({ accent }: { accent: string }) {
  return (
    <div className="grid h-full grid-cols-5 gap-1">
      {WEEK_EVENTS.map((event, day) => (
        <div key={day} className="relative rounded-sm bg-muted-foreground/15">
          {event && (
            <div className={`absolute inset-x-0.5 rounded-[2px] opacity-70 ${accent} ${event}`} />
          )}
        </div>
      ))}
    </div>
  );
}
