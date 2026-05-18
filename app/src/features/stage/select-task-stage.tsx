import type { Task } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StageIcon } from "./stage-visual";
import { useContext } from "react";
import { TaskContext } from "@/contexts/task/TaskContext";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { Layers2 } from "lucide-react";

type Props = {
  onChange?: (task: Task) => void;
  value?: Task["Stage"];
  onValueChange?: (value: Task["Stage"]) => void;
  placeholder?: string;
};

export function SelectTaskStage({
  onChange = () => {},
  value,
  onValueChange,
  placeholder = "Select a stage",
}: Props) {
  const { state, setState } = useContext(TaskContext);
  const { Stages } = useContext(ProjectContext);
  const isControlled = onValueChange !== undefined;

  const handleValueChange = (raw: string) => {
    const newStage = Number(raw);
    if (isControlled) {
      onValueChange(newStage);
      return;
    }
    setState({ ...state, Stage: newStage });
    onChange({ ...state, Stage: newStage });
  };

  const currentValue = isControlled
    ? value !== undefined && value !== 0
      ? String(value)
      : ""
    : state.Stage !== 0
      ? String(state.Stage)
      : "";

  console.log(value);

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger id="stage" className="w-full">
        <SelectValue
          placeholder={
            <>
              <Layers2 />
              {placeholder}
            </>
          }
        />
      </SelectTrigger>
      <SelectContent>
        {Stages.map((stage) => (
          <SelectItem key={stage.ID} value={String(stage.ID)}>
            <StageIcon stage={stage} />
            {stage.Name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
