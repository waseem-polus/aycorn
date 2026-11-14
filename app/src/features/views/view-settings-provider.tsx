import { useMemo, useState } from "react";
import { ViewSettingsContext } from "@/features/views/view-settings-context";

/**
 * Shares which view's settings are open between the view switcher (which
 * anchors the popover) and the settings button (which toggles it) — they sit
 * in different slots of the board toolbar.
 */
export function ViewSettingsProvider({ children }: { children: React.ReactNode }) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const value = useMemo(() => ({ editingId, setEditingId }), [editingId]);
  return (
    <ViewSettingsContext.Provider value={value}>
      {children}
    </ViewSettingsContext.Provider>
  );
}
