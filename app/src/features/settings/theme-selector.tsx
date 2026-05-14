import { cn } from "@/lib/utils";
import { ThemePreview } from "@/features/settings/theme-selector/theme-preview";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeValue = "light" | "dark" | "system";

type ThemeOption = {
  value: ThemeValue;
  label: string;
  description: string;
  icon: typeof Sun;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces, default for daytime use.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Dimmed surfaces, easier on the eyes at night.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follows your operating system setting.",
    icon: Monitor,
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = mounted ? theme : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            aria-pressed={selected}
            className={cn(
              "relative flex flex-col items-start gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent/30",
              selected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border",
            )}
          >
            <ThemePreview variant={option.value} />
            <div className="flex w-full items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="size-4" />
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </div>
              {selected && (
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
