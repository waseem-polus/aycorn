import { ThemeSelector } from "@/features/settings/theme-selector";
import { WeekStartSelector } from "@/features/settings/week-start-selector";

export function PreferencesPanel() {
  return (
    <div className="flex flex-col gap-8">
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
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">Week starts on</h2>
          <p className="text-sm text-muted-foreground">
            Decides what “this week” means in relative date filters, and the
            first column of their date pickers.
          </p>
        </div>
        <WeekStartSelector />
      </section>
    </div>
  );
}
