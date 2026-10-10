import { useProjectWorkflowSettingsQuery } from "@/features/settings/project-workflow/queries/useProjectWorkflowSettingsQuery";

// The project card's two badges (workflow and tasks) both open hover cards
// backed by the same request. Sharing one hook keeps their fetch behaviour
// identical: nothing is requested until a card is about to open, and because
// they share a query key, whichever badge is hovered first serves both.
const HOVER_STALE_TIME = 60_000;

export function useProjectCardStages(projectId: number, open: boolean) {
  return useProjectWorkflowSettingsQuery(projectId, {
    enabled: open,
    // Without this, re-opening a hover card refires the request every time.
    staleTime: HOVER_STALE_TIME,
  });
}
