import { createContext, useContext } from "react";

export type ViewSettingsState = {
  /** The view whose settings popover is open, if any. */
  editingId: number | null;
  setEditingId: (id: number | null) => void;
};

export const ViewSettingsContext = createContext<ViewSettingsState | null>(null);

export const useViewSettings = () => {
  const context = useContext(ViewSettingsContext);
  if (!context) {
    throw new Error("useViewSettings must be used inside a ViewSettingsProvider");
  }
  return context;
};
