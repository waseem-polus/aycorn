import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  label: string;
  onChange: (value: T) => void;
};

/** A row of mutually exclusive choices that always keeps one selected. */
export function SegmentedControl<T extends string>({ value, options, label, onChange }: Props<T>) {
  return (
    <ToggleGroup
      type="single"
      spacing={1}
      aria-label={label}
      value={value}
      // Radix sends "" when the active item is clicked again; keep the choice.
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
      className="w-full rounded-lg bg-muted p-[3px]"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="h-7 flex-1 shrink text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:bg-input/50"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
