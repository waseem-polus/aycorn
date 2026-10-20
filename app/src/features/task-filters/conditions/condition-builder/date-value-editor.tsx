import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDateFormat } from "@/hooks/useDateFormatter";
import { parseLocalDate, toYMD } from "@/utils/date";

type Props = {
  /** A local calendar day, `yyyy-MM-dd`, or "" when unset. */
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (date: string) => void;
};

/** A single-day picker for before / after / on. */
export function DateValueEditor({ date, open, onOpenChange, onChange }: Props) {
  const { toFormatted } = useDateFormat();
  const selected = date ? parseLocalDate(date) : undefined;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className={selected ? "" : "text-muted-foreground"}>
            {selected ? toFormatted(selected) : "Pick a day"}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" data-vaul-no-drag>
        <Calendar
          mode="single"
          className="p-0"
          captionLayout="dropdown"
          selected={selected}
          defaultMonth={selected}
          onSelect={(day) => {
            if (!day) return;
            onChange(toYMD(day));
            onOpenChange(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
