import { Check, Copy, Ellipsis, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContext, useMemo, useState } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectMutation } from "@/queries/useProjectMutation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function ProjectHeader() {
  const navigate = useNavigate();

  const { Project, Tasks, Checklists } = useContext(ProjectContext);
  const { updateProject, deleteProject } = useProjectMutation(Project.ID);

  const projectName = useMemo(
    () => (Project.Name !== "" ? Project.Name : "New Project"),
    [Project],
  );

  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(projectName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setisDeleteDialogOpen] = useState(false);
  const [input, setInput] = useState("");

  const isError = useMemo(
    () => input.length > 0 && !projectName.startsWith(input),
    [input, projectName],
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          updateProject.mutate({ ...Project, Pinned: !Project.Pinned });
        }}
      >
        {Project.Pinned ? <PinOff /> : <Pin />}
      </Button>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setisDeleteDialogOpen(open);
          setInput("");
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon-sm"
            >
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Pin</DropdownMenuItem>
            <DropdownMenuItem>Make a copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
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
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={input !== projectName || isError || isDeleting}
              onClick={() => {
                setIsDeleting(true);
                deleteProject.mutate(Project.ID, {
                  onSuccess: () =>
                    navigate({
                      to: "/",
                    }).then(() =>
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
    </>
  );
}
