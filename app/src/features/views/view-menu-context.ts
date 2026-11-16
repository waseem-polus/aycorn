import { createContext, useContext } from "react";

/** Where a view's menu is anchored: its tab, the toolbar button, or the mobile switcher. */
export type ViewMenuAnchor = "tab" | "button" | "mobile";

export type OpenViewMenu = { viewId: number; anchor: ViewMenuAnchor };

export type ViewMenuState = {
  /** The one view menu that's open, if any. */
  openMenu: OpenViewMenu | null;
  open: (viewId: number, anchor: ViewMenuAnchor) => void;
  /** Closes the menu only if it's still the one at `viewId` / `anchor`, so a
   *  menu being dismissed can't close the one that just replaced it. */
  close: (viewId: number, anchor: ViewMenuAnchor) => void;
  closeAll: () => void;
};

export const ViewMenuContext = createContext<ViewMenuState | null>(null);

export const useViewMenuState = () => {
  const context = useContext(ViewMenuContext);
  if (!context) {
    throw new Error("useViewMenuState must be used inside a ViewMenuProvider");
  }
  return context;
};
