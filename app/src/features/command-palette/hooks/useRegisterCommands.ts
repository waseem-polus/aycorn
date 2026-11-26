import { useEffect, useId } from "react";
import { useCommandPalette } from "@/features/command-palette/command-palette-context";
import type {
  CommandScope,
  PaletteCommand,
} from "@/features/command-palette/command-types";

/**
 * Adds commands to the palette for as long as the calling component is
 * mounted. Call it from the component that owns the state a command acts on
 * (e.g. the sort popover registers "Open sort editor" with its own setter), so
 * the palette's contents follow whatever page or panel is on screen.
 */
export const useRegisterCommands = (
  commands: PaletteCommand[],
  scope: CommandScope = "context",
) => {
  const { registry } = useCommandPalette();
  const key = useId();

  useEffect(() => {
    registry.set(key, { scope, commands });
  }, [registry, key, scope, commands]);

  useEffect(() => () => registry.remove(key), [registry, key]);
};
