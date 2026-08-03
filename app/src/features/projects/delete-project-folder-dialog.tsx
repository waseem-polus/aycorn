import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProjectFolderMutation } from "@/features/projects/queries/useProjectFolderMutation";
import { folderName } from "@/features/projects/folder-name";
import { cn } from "@/lib/utils";
import type { ProjectFolder } from "@/types/types";
import { toast } from "sonner";

type Props = {
  folder: ProjectFolder;
  allFolders: ProjectFolder[];
  projectCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteProjectFolderDialog({
  folder,
  allFolders,
  projectCount,
  open,
  onOpenChange,
}: Props) {
  const [transferId, setTransferId] = useState<number | null>(null);
  const { deleteFolder } = useProjectFolderMutation();

  const candidates = allFolders.filter((f) => f.ID !== folder.ID);
  const displayName = folderName(folder);
  const hasProjects = projectCount > 0;

  const handleOpenChange = (next: boolean) => {
    if (!next) setTransferId(null);
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{displayName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasProjects
              ? "This folder has projects. Choose a folder to move them to before deleting."
              : "This folder is empty and will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasProjects && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-60">
            {candidates.map((f) => {
              const selected = transferId === f.ID;
              return (
                <button
                  key={f.ID}
                  type="button"
                  onClick={() => setTransferId(f.ID)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="flex-1 min-w-0 text-sm font-medium truncate">
                    {folderName(f)}
                  </span>
                  <span
                    className={cn(
                      "size-4 shrink-0 rounded-full border-2 transition-colors",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground",
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={
              (hasProjects && transferId === null) || deleteFolder.isPending
            }
            onClick={() =>
              deleteFolder.mutate(
                { id: folder.ID, transferFolderId: transferId ?? undefined },
                {
                  onSuccess: () => toast(`Deleted "${displayName}".`),
                  onError: (err) =>
                    toast.error(err.message || "Failed to delete folder."),
                },
              )
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
