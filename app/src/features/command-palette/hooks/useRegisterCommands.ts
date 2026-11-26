import { useContext, useEffect, useId, useState } from "react";
import { useCommandPalette } from "@/features/command-palette/command-palette-context";
import { CommandScopeContext } from "@/features/command-palette/command-scope-context";
import type {
  CommandScope,
  PaletteCommand,
} from "@/features/command-palette/command-types";

/**
 * Adds commands to the palette for as long as the calling component is
 * mounted. Call it from the component that owns the state a command acts on
 * (e.g. the sort popover registers "Open sort editor" with its own setter), so
 * the palette's contents follow whatever page or panel is on screen.
 *
 * Without an explicit `scope`, commands take the nearest CommandScopeContext's
 * scope, so everything inside the task drawer sorts as "overlay".
 */
export const useRegisterCommands = (
  commands: PaletteCommand[],
  {
    scope: explicitScope,
    enabled = true,
  }: {
    scope?: CommandScope;
    /** For components mounted before they're shown, like a closed drawer. */
    enabled?: boolean;
  } = {},
) => {
  const { registry } = useCommandPalette();
  const inheritedScope = useContext(CommandScopeContext);
  const scope = explicitScope ?? inheritedScope;
  const key = useId();
  const [order] = useState(registry.takeOrder);

  useEffect(() => {
    if (enabled) registry.set(key, order, { scope, commands });
    else registry.remove(key);
  }, [registry, key, order, scope, commands, enabled]);

  useEffect(() => () => registry.remove(key), [registry, key]);
};
