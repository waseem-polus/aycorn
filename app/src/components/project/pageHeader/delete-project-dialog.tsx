import { Check, Copy } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({ open, onOpenChange }: DeleteProjectDialogProps) {
  const navigate = useNavigate();

  const { Project, Tasks, Checklists } = useContext(ProjectContext);
  const { deleteProject } = useProjectMutation(Project.ID);

  const projectName = useMemo(
    () => (Project.Name !== "" ? Project.Name : "New Project"),
    [Project],
  );

  const [input, setInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isError = useMemo(
    () => input.length > 0 && !projectName.startsWith(input),
    [input, projectName],
  );

  function handleCopy() {
    navigator.clipboard.writeText(projectName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) setInput("");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone.{" "}
            <b>
              {Tasks.length} task{Tasks.length !== 1 ? "s" : ""}
            </b>{" "}
            and{" "}
            <b>
              {Checklists.length} checklist
              {Checklists.length !== 1 ? "s" : ""}
            </b>{" "}
            will be deleted. Type
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded px-1 font-bold text-foreground hover:bg-muted transition-colors underline"
            >
              {projectName}
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pb-2">
          <Input
            id="confirm-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Project Name..."
            autoComplete="off"
            aria-invalid={isError}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={input !== projectName || isError || isDeleting}
            onClick={() => {
              setIsDeleting(true);
              deleteProject.mutate(Project.ID, {
                onSuccess: () =>
                  navigate({ to: "/" }).then(() =>
                    setTimeout(
                      () => toast(`Deleted ${Project.Name} successfully.`),
                      200,
                    ),
                  ),
                onError: () => toast(`Failed deleting project.`),
                onSettled: () => setIsDeleting(false),
              });
            }}
          >
            Confirm and Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
