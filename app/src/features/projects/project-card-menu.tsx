import { useState } from "react";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CopyIcon,
  FolderInput,
  MoreHorizontal,
  PinIcon,
  PinOffIcon,
  SettingsIcon,
  TextCursorInputIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconColorPickerMenuItem } from "@/features/icon-picker/icon-color-picker-menu-item";
import { folderName } from "@/features/projects/folder-name";
import type { Project, ProjectFolder } from "@/types/types";

type Props = {
  project: Project;
  folders: ProjectFolder[];
  onRename: () => void;
  onIconSelect: (iconName: string) => void;
  onColorSelect: (color: string) => void;
  onTogglePin: () => void;
  onToggleArchive: () => void;
  onDuplicate: () => void;
  onMoveToFolder: (folderId: number) => void;
  onSettings: () => void;
  onWorkflow: () => void;
  onDelete: () => void;
};

export function ProjectCardMenu({
  project,
  folders,
  onRename,
  onIconSelect,
  onColorSelect,
  onTogglePin,
  onToggleArchive,
  onDuplicate,
  onMoveToFolder,
  onSettings,
  onWorkflow,
  onDelete,
}: Props) {
  // An archived project is out of play: it can only be restored or removed.
  const archived = project.Archived;
  const [open, setOpen] = useState(false);

  return (
    // modal={false} so the icon picker's popover, which opens from a menu item,
    // stays interactive — a modal menu blocks pointer events outside itself.
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {/* The card navigates on click, and Radix portals still bubble through
            the React tree — without this the menu never opens. */}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Project options"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {archived ? (
          <DropdownMenuItem onClick={onToggleArchive}>
            <ArchiveRestoreIcon className="text-muted-foreground" />
            Unarchive
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={onRename}>
              <TextCursorInputIcon className="text-muted-foreground" />
              Rename
            </DropdownMenuItem>
            <IconColorPickerMenuItem
              iconValue={project.Icon}
              colorValue={project.Color}
              onIconSelect={onIconSelect}
              onColorSelect={onColorSelect}
              onDone={() => setOpen(false)}
            />
            <DropdownMenuItem onClick={onTogglePin}>
              {project.Pinned ? (
                <PinOffIcon className="text-muted-foreground" />
              ) : (
                <PinIcon className="text-muted-foreground" />
              )}
              {project.Pinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <FolderInput className="text-muted-foreground" />
                Move to folder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {folders.map((folder) => (
                  <DropdownMenuItem
                    key={folder.ID}
                    disabled={folder.ID === project.Folder}
                    onClick={() => onMoveToFolder(folder.ID)}
                  >
                    {folderName(folder)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem onClick={onDuplicate}>
              <CopyIcon className="text-muted-foreground" />
              Duplicate configuration
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onSettings}>
              <SettingsIcon className="text-muted-foreground" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onWorkflow}>
              <WorkflowIcon className="text-muted-foreground" />
              Workflow
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={onToggleArchive}>
              <ArchiveIcon className="text-muted-foreground" />
              Archive
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2Icon className="text-muted-foreground" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
