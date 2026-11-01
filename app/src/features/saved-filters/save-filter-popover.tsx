import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
  trigger: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void> | void;
  defaultName?: string;
  align?: "start" | "end";
};

/** Names a new filter before it's saved: type, Enter. */
export function SaveFilterPopover({
  trigger,
  open,
  onOpenChange,
  onSave,
  defaultName = "",
  align = "end",
}: Props) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onSave(name.trim());
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setName(defaultName);
        onOpenChange(next);
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72" align={align} data-vaul-no-drag>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted-foreground">Name this filter</span>
            <Input
              autoFocus
              value={name}
              placeholder="e.g. Blocked this week"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </label>
          <Button type="submit" size="sm" disabled={!name.trim() || saving}>
            Save filter
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
