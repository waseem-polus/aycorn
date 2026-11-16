import { useMemo, useState } from "react";
import {
  ViewMenuContext,
  type OpenViewMenu,
  type ViewMenuAnchor,
} from "@/features/views/view-menu-context";

/**
 * Shares which view's menu is open between the view switcher (tabs) and the
 * toolbar's settings button — they sit in different slots of the board
 * toolbar but share one menu, so only one is ever open.
 */
export function ViewMenuProvider({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState<OpenViewMenu | null>(null);

  const value = useMemo(() => {
    const open = (viewId: number, anchor: ViewMenuAnchor) =>
      setOpenMenu({ viewId, anchor });
    const close = (viewId: number, anchor: ViewMenuAnchor) =>
      setOpenMenu((current) =>
        current?.viewId === viewId && current.anchor === anchor ? null : current,
      );
    const closeAll = () => setOpenMenu(null);
    return { openMenu, open, close, closeAll };
  }, [openMenu]);

  return (
    <ViewMenuContext.Provider value={value}>{children}</ViewMenuContext.Provider>
  );
}
