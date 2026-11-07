import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAppSettingsMutation } from "@/features/settings/queries/useAppSettingsMutation";
import { useAppSettingsQuery } from "@/features/settings/queries/useAppSettingsQuery";
import type { WeekStartsOn } from "@/features/settings/settings-types";

const OPTIONS: { value: WeekStartsOn; label: string }[] = [
  { value: 1, label: "Monday" },
  { value: 0, label: "Sunday" },
];

export function WeekStartSelector() {
  const { settings } = useAppSettingsQuery();
  const save = useAppSettingsMutation();

  const handleChange = (value: string) => {
    // Radix sends "" when the active item is clicked again; keep the choice.
    if (!value) return;
    save.mutate(
      { ...settings, weekStartsOn: Number(value) as WeekStartsOn },
      { onError: () => toast.error("Couldn't save the week start. Try again.") },
    );
  };

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={String(settings.weekStartsOn)}
      onValueChange={handleChange}
      disabled={save.isPending}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={String(option.value)}
          className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
