import { useState } from "react";
import { useHotkeys } from "@tanstack/react-hotkeys";

type Options = {
  /** Receives the editable element, e.g. to blur it. */
  onEnter?: (element: HTMLElement) => void;
  onEscape?: (element: HTMLElement) => void;
  enabled?: boolean;
};

/**
 * Enter / Escape on an editable element (input or contenteditable) that
 * commits or cancels the edit. Returns a callback ref to put on that element:
 * the keys are bound to the element itself once it mounts (these editors
 * mount late — conditionally, or inside a portal), so typing keys are never
 * swallowed, and the event still propagates (a popover can close on Escape).
 */
export function useEditKeys({ onEnter, onEscape, enabled = true }: Options) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useHotkeys(
    [
      ...(onEnter
        ? [{ hotkey: "Enter" as const, callback: () => element && onEnter(element) }]
        : []),
      ...(onEscape
        ? [{ hotkey: "Escape" as const, callback: () => element && onEscape(element) }]
        : []),
    ],
    {
      target: element,
      enabled: enabled && element !== null,
      ignoreInputs: false,
      stopPropagation: false,
      // Editors often stop keydown propagation so app shortcuts don't fire while
      // typing; capture runs before those handlers.
      capture: true,
    },
  );

  return setElement;
}
