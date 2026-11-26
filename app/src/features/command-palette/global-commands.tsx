import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { PanelLeftIcon, SunMoonIcon } from "lucide-react";
import { navConfigure, navMain, navSecondary } from "@/components/sidebar/nav-items";
import { sidebarHotkey, useSidebar } from "@/components/ui/sidebar";
import type { PaletteCommand } from "@/features/command-palette/command-types";
import { useRegisterCommands } from "@/features/command-palette/hooks/useRegisterCommands";

const THEME_CYCLE = ["light", "dark", "system"] as const;
type ThemeValue = (typeof THEME_CYCLE)[number];

const themeLabels: Record<ThemeValue, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

const toThemeValue = (theme: string | undefined): ThemeValue =>
  THEME_CYCLE.find((value) => value === theme) ?? "system";

/** Commands available on every page. Renders nothing; mount once inside the providers it reads. */
export function GlobalCommands() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  const currentTheme = toThemeValue(theme);
  const nextTheme =
    THEME_CYCLE[(THEME_CYCLE.indexOf(currentTheme) + 1) % THEME_CYCLE.length];

  const navigationCommands: PaletteCommand[] = [
    ...navMain,
    ...navConfigure,
    ...navSecondary,
  ].map((item) => ({
    id: `navigate${item.url}`,
    title: `Go to ${item.title}`,
    group: "Navigation",
    icon: item.icon,
    keywords: ["navigate", "open", "page"],
    run: () => navigate({ to: item.url }),
  }));

  useRegisterCommands(
    [
      ...navigationCommands,
      {
        id: "theme.cycle",
        title: "Toggle theme",
        group: "General",
        icon: SunMoonIcon,
        hint: `${themeLabels[currentTheme]} → ${themeLabels[nextTheme]}`,
        keywords: ["dark", "light", "system", "appearance", "mode"],
        run: () => setTheme(nextTheme),
      },
      {
        id: "sidebar.toggle",
        title: "Toggle sidebar",
        group: "General",
        icon: PanelLeftIcon,
        hotkey: sidebarHotkey,
        keywords: ["show", "hide", "collapse", "expand"],
        run: toggleSidebar,
      },
    ],
    "global",
  );

  return null;
}
