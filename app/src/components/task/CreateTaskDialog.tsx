import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectTaskStatus } from "./SelectTaskStatus";
import { SelectTaskType } from "./SelectTaskType";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { User } from "lucide-react";
import { SelectTaskPriority } from "./SelectTaskPriority";
import { DatePickerInput } from "../DatePickerInput";
import { useCallback, useContext } from "react";
import {
  defaultTaskContextValue,
  TaskContext,
} from "@/contexts/task/TaskContext";
import { SelectChecklist } from "./SelectChecklist";
import { toast } from "sonner";

export function CreateTaskDialog({ children }: { children: React.ReactNode }) {
  const { state: task, setState: setTask } = useContext(TaskContext);

  const handleSubmit = useCallback(() => {
    toast.promise(
      fetch("http://localhost:8000/api/task", {
        method: "POST",
        body: JSON.stringify(task),
      }),
      {
        loading: "Creating task...",
        success: "Task has been created!",
        error: "Failed creating task :(",
      },
    );
  }, [task]);

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTask(defaultTaskContextValue.state);
        }
      }}
    >
      <form>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="flex gap-3">
              <Label htmlFor="name" className="min-w-1/5">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={task.Name}
                onChange={(e) =>
                  setTask({ ...task, Name: e.target.value ?? "" })
                }
              />
            </div>
            <div className="flex gap-3">
              <Label htmlFor="name" className="min-w-1/5">
                Checklist
              </Label>
              <SelectChecklist />
            </div>

            <br className="my-2" />

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Assignee
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Assignee"
                  value={task.Assignee}
                  onChange={(e) =>
                    setTask({ ...task, Assignee: e.target.value ?? "" })
                  }
                />
              </InputGroup>
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Date
              </Label>
              <DatePickerInput />
            </div>

            <br className="my-2" />

            <div className="flex gap-3">
              <Label htmlFor="status" className="min-w-1/5">
                Status
              </Label>
              <SelectTaskStatus />
            </div>

            <div className="flex gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <SelectTaskType />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="priority" className="min-w-1/5">
                Priority
              </Label>
              <SelectTaskPriority />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" onClick={handleSubmit}>
                Create Task
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
