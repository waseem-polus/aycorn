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
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);
  const { updateProject } = useProjectMutation(Project.ID);

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
        onOpenChange={(open) => setisDeleteDialogOpen(open)}
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
              This action is permanent and cannot be undone. All tasks,
              checklists, and project data will be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label
              htmlFor="confirm-input"
              className="text-sm text-muted-foreground"
            >
              Type{" "}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded px-1 text-foreground hover:bg-muted transition-colors"
              >
                {projectName}
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>{" "}
              to confirm
            </Label>
            <Input
              id="confirm-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
              placeholder={projectName}
              autoComplete="off"
              aria-invalid={isError}
            />
            {isError && (
              <p className="text-xs text-destructive">
                Project name doesn't match.
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                variant="destructive"
                disabled={input !== projectName || isError}
              >
                Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
