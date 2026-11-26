import { createContext, useContext, useEffect, useEffectEvent } from "react";

/**
 * Things a keyboard shortcut or the command palette can ask the board toolbar
 * for. They target pieces of the filter row, which may be hidden (and so not
 * mounted) when asked; the toolbar shows the row first.
 */
export type BoardToolbarAction = "sort" | "filter" | "createSavedFilter";

type BoardToolbarRequestValue = {
  request: { action: BoardToolbarAction } | null;
  clearRequest: () => void;
};

export const BoardToolbarRequestContext =
  createContext<BoardToolbarRequestValue>({
    request: null,
    clearRequest: () => {},
  });

/**
 * Runs `handle` once per request for `action`, in the component that owns
 * that piece (e.g. the Sort popover toggles itself open). Requests are
 * one-shot: handling one clears it, so a later remount won't replay it.
 */
export const useBoardToolbarRequest = (
  action: BoardToolbarAction,
  handle: () => void,
) => {
  const { request, clearRequest } = useContext(BoardToolbarRequestContext);
  const onRequest = useEffectEvent(handle);

  useEffect(() => {
    if (request?.action !== action) return;
    clearRequest();
    onRequest();
  }, [request, action, clearRequest]);
};
