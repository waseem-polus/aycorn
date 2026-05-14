import { ThemeSelector } from "@/features/settings/theme-selector";

export function PreferencesPanel() {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="font-medium">Theme</h2>
        <p className="text-sm text-muted-foreground">
          Choose how Aycorn looks to you. Select a theme or sync with your
          system.
        </p>
      </div>
      <ThemeSelector />
    </section>
  );
}
