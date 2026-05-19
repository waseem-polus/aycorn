import type { LucideIcon } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";

export type IconCache = {
  names: string[];
  map: Map<string, LucideIcon>;
};

// `iconNames` is the authoritative kebab list (also what `DynamicIcon` accepts
// and what `stage.Icon` stores). The full module's component map is keyed
// PascalCase. Lucide derives those PascalCase names from kebab via toPascalCase,
// so kebab→Pascal is the lossless direction (Pascal→kebab is not — e.g.
// `AArrowDown` → "aarrow-down", but the real name is "a-arrow-down").
const toPascalCase = (s: string) =>
  s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

let cache: Promise<IconCache> | null = null;

export function loadIcons(): Promise<IconCache> {
  if (!cache) {
    cache = import("lucide-react").then((mod) => {
      const icons = mod.icons as unknown as Record<string, LucideIcon>;
      const map = new Map<string, LucideIcon>();
      for (const name of iconNames) {
        const Component = icons[toPascalCase(name)];
        if (Component) map.set(name, Component);
      }
      const names = [...map.keys()].sort();
      return { names, map };
    });
  }
  return cache;
}
