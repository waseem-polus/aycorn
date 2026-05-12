import { useState } from "react";
import { Pin, PinOff, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAllProjectsMutation } from "@/queries/useAllProjectsMutation";
import type { Project } from "@/types/types";

type BulkActionsToolbarProps = {
  selectedProjects: Project[];
  onClear: () => void;
};

export function BulkActionsToolbar({
  selectedProjects,
  onClear,
}: BulkActionsToolbarProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { bulkSetPinned, bulkDelete } = useAllProjectsMutation();
  const count = selectedProjects.length;

  if (count === 0) return null;

  const busy = bulkSetPinned.isPending || bulkDelete.isPending;

  const handleSetPinned = (pinned: boolean) =>
    bulkSetPinned.mutate(
      { projects: selectedProjects, pinned },
      {
        onSuccess: onClear,
        onError: () => toast("Failed updating projects."),
      },
    );

  const handleDelete = () =>
    bulkDelete.mutate(
      selectedProjects.map((p) => p.ID),
      {
        onSuccess: () => {
          toast(`Deleted ${count} project${count !== 1 ? "s" : ""}.`);
          setDeleteOpen(false);
          onClear();
        },
        onError: () => toast("Failed deleting projects."),
      },
    );

  return (
    <>
      <div
        data-keep-selection=""
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-lg border bg-background px-3 py-1.5 shadow-lg"
      >
        <span className="text-sm font-medium px-2">{count} selected</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X />
        </Button>
        <Separator orientation="vertical" className="!h-6 mx-1" />
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
        <Separator orientation="vertical" className="!h-6 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          disabled={busy}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
          Delete
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} project{count !== 1 ? "s" : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={bulkDelete.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
