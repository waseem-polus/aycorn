import { createContext } from "react";
import type { CommandScope } from "@/features/command-palette/command-types";

/**
 * The scope commands registered below this provider default to. A surface
 * layered over the page (the task drawer) provides "overlay" so its commands,
 * and those of every component inside it, list before the page's own.
 */
export const CommandScopeContext = createContext<CommandScope>("context");
