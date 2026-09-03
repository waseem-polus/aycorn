import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  FolderInput,
  Palette,
  Pin,
  PinOff,
  Shapes,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BulkActionsToolbarBase } from "@/components/bulk-actions-toolbar-base";
import { IconPickerPopover } from "@/features/icon-picker/icon-picker-popover";
import { ColorGrid } from "@/features/color-picker/color-grid";
import { useSharedSelection } from "@/hooks/useSelection";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import { bulkResultToast } from "@/features/workflows/shared/bulk-result-toast";
import { folderName } from "@/features/projects/folder-name";
import type { Project, ProjectFolder } from "@/types/types";

type Props = {
  projects: Project[];
  folders: ProjectFolder[];
  /** The Archived view offers Unarchive instead of Pin/Archive/Move. */
  archivedView: boolean;
};

export function ProjectsBulkActionsToolbar({
  projects,
  folders,
  archivedView,
}: Props) {
  const { selectedIds, clearSelection } = useSharedSelection();
  const {
    bulkSetPinned,
    bulkSetArchived,
    bulkSetFolder,
    bulkUpdateProjects,
    bulkDelete,
  } = useAllProjectsMutation();
  const [colorOpen, setColorOpen] = useState(false);

  const selectedProjects = useMemo(
    () => projects.filter((p) => selectedIds.has(`proj-${p.ID}`)),
    [projects, selectedIds],
  );

  const count = selectedProjects.length;
  const ids = selectedProjects.map((p) => p.ID);
  const busy =
    bulkSetPinned.isPending ||
    bulkSetArchived.isPending ||
    bulkSetFolder.isPending ||
    bulkUpdateProjects.isPending;

  const noun = (n: number) => `${n} project${n !== 1 ? "s" : ""}`;

  const handleSetPinned = (pinned: boolean) =>
    bulkSetPinned.mutate(
      { ids, pinned },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `${pinned ? "Pinned" : "Unpinned"} ${noun(result.success)}.`,
          );
          clearSelection();
        },
        onError: () => toast.error("Failed updating projects."),
      },
    );

  const handleSetArchived = (archived: boolean) =>
    bulkSetArchived.mutate(
      { ids, archived },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `${archived ? "Archived" : "Restored"} ${noun(result.success)}.`,
          );
          clearSelection();
        },
        onError: () => toast.error("Failed updating projects."),
      },
    );

  const handleMoveToFolder = (folder: ProjectFolder) =>
    bulkSetFolder.mutate(
      { ids, folder: folder.ID },
      {
        onSuccess: (result) => {
          bulkResultToast(
            result,
            `Moved ${noun(result.success)} to ${folderName(folder)}.`,
          );
          clearSelection();
        },
        onError: () => toast.error("Failed moving projects."),
      },
    );

  const handleAppearance = (changes: Partial<Pick<Project, "Icon" | "Color">>) =>
    bulkUpdateProjects.mutate(
      { ids, changes },
      {
        onSuccess: (result) => {
          bulkResultToast(result, `Updated ${noun(result.success)}.`);
          clearSelection();
        },
        onError: () => toast.error("Failed updating projects."),
      },
    );

  const handleDelete = () =>
    bulkDelete.mutate(ids, {
      onSuccess: (result) => {
        bulkResultToast(result, `Deleted ${noun(result.success)}.`);
        clearSelection();
      },
      onError: () => toast.error("Failed deleting projects."),
    });

  return (
    <BulkActionsToolbarBase
      count={count}
      onClear={clearSelection}
      delete={{
        onConfirm: handleDelete,
        title: `Delete ${noun(count)}?`,
        description: "This action cannot be undone.",
        busy: bulkDelete.isPending,
      }}
    >
      {archivedView ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSetArchived(false)}
          disabled={busy}
        >
          <ArchiveRestore />
          Unarchive
        </Button>
      ) : (
        <>
          <IconPickerPopover
            value=""
            onSelect={(icon) => handleAppearance({ Icon: icon })}
            align="center"
            trigger={
              <Button variant="ghost" size="sm" disabled={busy}>
                <Shapes />
                Icon
              </Button>
            }
          />

          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" disabled={busy}>
                <Palette />
                Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center">
              <ColorGrid
                value=""
                onSelect={(color) => {
                  setColorOpen(false);
                  handleAppearance({ Color: color });
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetPinned(true)}
            disabled={busy}
          >
            <Pin />
            Pin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetPinned(false)}
            disabled={busy}
          >
            <PinOff />
            Unpin
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={busy}>
                <FolderInput />
                Move
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.ID}
                  onClick={() => handleMoveToFolder(folder)}
                >
                  {folderName(folder)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSetArchived(true)}
            disabled={busy}
          >
            <Archive />
            Archive
          </Button>
        </>
      )}
    </BulkActionsToolbarBase>
  );
}
