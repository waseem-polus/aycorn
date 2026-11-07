import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RelativeDatePanel } from "@/features/task-filters/conditions/condition-builder/date-ref-editor/relative-date-panel";
import type { DateRef } from "@/features/task-filters/conditions/condition-types";
import {
  dateRefLabel,
  dateSpanHint,
  resolveDateRef,
  toAbsoluteRef,
  toRelativeRef,
  type DateContext,
} from "@/features/task-filters/conditions/relative-dates";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import { useToday } from "@/features/task-filters/hooks/useToday";
import { parseLocalDate, toYMD } from "@/utils/date";

type Props = {
  value: DateRef | null;
  /**
   * Which side of a span this value is read from: the `to` end of a range
   * and `after` read the span's last day, everything else its first. Only
   * matters when pinning a relative value to a day.
   */
  edge?: "start" | "end";
  placeholder?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: DateRef | null) => void;
};

type Mode = DateRef["kind"];

/** One day or span of days, picked as a calendar date or relative to today. */
export function DateRefEditor({
  value,
  edge = "start",
  placeholder = "Pick a day",
  open,
  onOpenChange,
  onChange,
}: Props) {
  const today = useToday();
  const { weekStartsOn } = useAppSettingsQuery().settings;
  const ctx: DateContext = { today, weekStartsOn };

  // The tab is its own state so an empty value can still open on Relative;
  // it re-syncs to the value's kind each time the popover opens.
  const [tab, setTab] = useState<Mode>(value?.kind ?? "absolute");
  const label = value ? dateRefLabel(value) : null;
  const hint = value?.kind === "relative" ? dateSpanHint(resolveDateRef(value, ctx)) : null;
  const selectedDay = value?.kind === "absolute" ? parseLocalDate(value.date) : undefined;

  // Switching tabs carries the value over rather than dropping it: a day
  // becomes the same day as an offset, a relative value pins to today's day.
  const handleTabChange = (next: string) => {
    const nextTab = next as Mode;
    setTab(nextTab);
    if (!value || nextTab === value.kind) return;
    onChange(nextTab === "relative" ? toRelativeRef(value, ctx) : toAbsoluteRef(value, ctx, edge));
  };

  const handleOpenChange = (next: boolean) => {
    if (next) setTab(value?.kind ?? "absolute");
    onOpenChange(next);
  };

  const commit = (ref: DateRef) => {
    onChange(ref);
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between gap-3 font-normal">
              <span className={label ? "truncate" : "truncate text-muted-foreground"}>
                {label ?? placeholder}
              </span>
              <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {hint}
                <CalendarIcon className="size-4" />
              </span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        {label && (
          <TooltipContent>{hint ? `${label} · ${hint}` : label}</TooltipContent>
        )}
      </Tooltip>
      <PopoverContent className="w-auto p-3" align="start" data-vaul-no-drag>
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="absolute">Date</TabsTrigger>
            <TabsTrigger value="relative">Relative</TabsTrigger>
          </TabsList>
          <TabsContent value="absolute">
            <Calendar
              mode="single"
              className="p-0"
              captionLayout="dropdown"
              weekStartsOn={weekStartsOn}
              selected={selectedDay}
              defaultMonth={selectedDay}
              onSelect={(day) => {
                if (day) commit({ kind: "absolute", date: toYMD(day) });
              }}
            />
          </TabsContent>
          <TabsContent value="relative">
            <RelativeDatePanel
              value={value?.kind === "relative" ? value : null}
              ctx={ctx}
              onChange={onChange}
              onCommit={commit}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
