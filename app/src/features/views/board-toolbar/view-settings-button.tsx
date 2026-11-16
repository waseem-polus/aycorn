import { Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { DeleteViewDialog } from "@/features/views/delete-view-dialog";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { useViewActions } from "@/features/views/hooks/useViewActions";
import { ViewMenu } from "@/features/views/view-menu";
import { useViewMenuState } from "@/features/views/view-menu-context";

type Props = {
  api: BoardViewsAPI;
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** The values the data-source editor offers on this board. */
  sources: ConditionOptionSources;
};

/**
 * Opens the selected view's menu, anchored to the button. It's the same menu
 * as the tab's right-click (they share one open state, so only one shows).
 */
export function ViewSettingsButton({ api, selectedId, onSelect, sources }: Props) {
  const menuState = useViewMenuState();
  const actions = useViewActions(api, selectedId, onSelect);
  const { views } = api;
  const view = views.find((v) => v.ID === selectedId);
  const open =
    view !== undefined &&
    menuState.openMenu?.viewId === view.ID &&
    menuState.openMenu.anchor === "button";

  return (
    <>
      <Tooltip open={open ? false : undefined}>
        {view ? (
          <ViewMenu
            view={view}
            api={api}
            sources={sources}
            isFirst={views[0]?.ID === view.ID}
            isLast={views[views.length - 1]?.ID === view.ID}
            open={open}
            onOpenChange={(next) =>
              next
                ? menuState.open(view.ID, "button")
                : menuState.close(view.ID, "button")
            }
            onMove={(delta) => actions.move(view.ID, delta)}
            onDuplicate={() => void actions.duplicate(view.ID)}
            onDelete={() => actions.setDeleting(view)}
            align="end"
            trigger={
              <TooltipTrigger asChild>
                <SettingsButton />
              </TooltipTrigger>
            }
          />
        ) : (
          <TooltipTrigger asChild>
            <SettingsButton disabled />
          </TooltipTrigger>
        )}
        <TooltipContent>View settings</TooltipContent>
      </Tooltip>

      {actions.deleting && (
        <DeleteViewDialog
          view={actions.deleting}
          open
          onOpenChange={(next) => !next && actions.setDeleting(null)}
          onConfirm={() => void actions.confirmDelete()}
        />
      )}
    </>
  );
}

function SettingsButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="View settings"
      data-view-settings-toggle=""
      {...props}
    >
      <Settings2Icon />
    </Button>
  );
}
