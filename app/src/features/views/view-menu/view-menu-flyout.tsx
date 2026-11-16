import { ChevronRightIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  icon: React.ReactNode;
  label: string;
  /** The current setting, shown at the row's right edge. */
  value?: React.ReactNode;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Sizing for the flyout, e.g. its width. */
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * One row of the view menu that opens a flyout beside it: click, Enter or →.
 * The row is the popover's trigger, and selecting it keeps the menu open
 * (closing it would unmount the flyout's anchor). The host menu must be
 * `modal={false}`, as with `IconColorPickerMenuItem`.
 */
export function ViewMenuFlyout({
  icon,
  label,
  value,
  disabled,
  open,
  onOpenChange,
  contentClassName,
  children,
}: Props) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <DropdownMenuItem
          disabled={disabled}
          onSelect={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight") return;
            e.preventDefault();
            onOpenChange(true);
          }}
        >
          {icon}
          {label}
          {value !== undefined && (
            <span className="ml-auto max-w-32 truncate text-xs text-muted-foreground">
              {value}
            </span>
          )}
          <ChevronRightIcon
            className={cn(
              "text-muted-foreground",
              value === undefined && "ml-auto",
            )}
          />
        </DropdownMenuItem>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={contentClassName}
        // Clicks in the flyout must not reach whatever the menu sits in.
        onClick={(e) => e.stopPropagation()}
        // Closes on a click away or Escape, not when the page moves focus
        // (a layout change mounts a view that grabs it) or when a nested
        // picker's popover takes it.
        onFocusOutside={(e) => e.preventDefault()}
        // Nor is a click on a toast (e.g. Undo after clearing conditions).
        onInteractOutside={(e) => {
          if ((e.target as Element | null)?.closest("[data-sonner-toaster]")) {
            e.preventDefault();
          }
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
