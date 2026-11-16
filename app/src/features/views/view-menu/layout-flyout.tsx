import { Switch } from "@/components/ui/switch";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { LayoutSelector } from "@/features/views/layout-selector";
import type { ViewType } from "@/features/views/view-types";

type Props = {
  type: ViewType;
  onChange: (type: ViewType) => void;
};

/**
 * The Layout flyout: the layout cards, then options for the selected layout
 * (for now, the calendar's two display toggles on Month and Week). The
 * toggles are the calendar's own global settings, not per view.
 */
export function LayoutFlyout({ type, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <LayoutSelector
        value={type}
        onChange={onChange}
        className="gap-2 sm:grid-cols-2"
      />
      {(type === "month" || type === "week") && <CalendarOptions />}
    </div>
  );
}

function CalendarOptions() {
  const { badgeVariant, setBadgeVariant, use24HourFormat, toggleTimeFormat } =
    useCalendar();

  return (
    <div className="flex flex-col gap-2 border-t pt-3 text-sm">
      <label className="flex cursor-pointer items-center justify-between gap-4">
        Use dot badge
        <Switch
          checked={badgeVariant === "dot"}
          onCheckedChange={(checked) =>
            setBadgeVariant(checked ? "dot" : "colored")
          }
        />
      </label>
      <label className="flex cursor-pointer items-center justify-between gap-4">
        Use 24 hour format
        <Switch checked={use24HourFormat} onCheckedChange={toggleTimeFormat} />
      </label>
    </div>
  );
}
