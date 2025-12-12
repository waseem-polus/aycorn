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

export function CreateTaskDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="flex gap-3">
              <Label htmlFor="name-1" className="min-w-1/5">
                Name
              </Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Assignee
              </Label>
              <InputGroup>
                <InputGroupAddon>
                  <User />
                </InputGroupAddon>
                <InputGroupInput placeholder="Assignee" />
              </InputGroup>
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Planned For
              </Label>
              <DatePickerInput />
            </div>

            <div className="flex gap-3">
              <Label htmlFor="status" className="min-w-1/5">
                Status
              </Label>
              <SelectTaskStatus status={"Open"} />
            </div>

            <div className="flex gap-3">
              <Label htmlFor="type" className="min-w-1/5">
                Type
              </Label>
              <SelectTaskType type="Dev" />
            </div>

            <div className="flex flex-row gap-3">
              <Label htmlFor="priority" className="min-w-1/5">
                Priority
              </Label>
              <SelectTaskPriority priority="Low" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
