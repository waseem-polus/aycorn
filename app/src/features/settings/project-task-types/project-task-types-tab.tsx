import { useState } from "react";
import { LockIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useProjectTaskTypeSettingsQuery } from "@/features/settings/project-task-types/queries/useProjectTaskTypeSettingsQuery";
import { useProjectTaskTypesMutation } from "@/features/settings/project-task-types/queries/useProjectTaskTypesMutation";
import { toast } from "sonner";
import type { TaskType } from "@/types/types";
import { cn } from "@/lib/utils";

// Enabled section: new cards slide up from below (they came from Available, which is below)
const enabledVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// Available section: new cards slide down from above (they came from Enabled, which is above)
const availableVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

type TaskTypeCardProps = {
  type: TaskType;
  onToggle: (type: TaskType, checked: boolean) => void;
};

const TaskTypeCard = ({ type, onToggle }: TaskTypeCardProps) => (
  <Card className="relative gap-2 rounded-lg py-4 shadow-none h-full">
    <CardHeader className="px-4 gap-1">
      <CardTitle className="font-medium flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <DynamicIcon
            name={type.Icon as any}
            className={cn("size-4 shrink-0", stageStrokeClass(type.Color))}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">{type.Name || "Untitled Type"}</span>
            </TooltipTrigger>
            {type.Name && <TooltipContent>{type.Name}</TooltipContent>}
          </Tooltip>
        </span>

        {type.IsDefault ? (
          <LockIcon className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Switch
            checked={true}
            onCheckedChange={(checked) => onToggle(type, checked)}
            aria-label={`Toggle ${type.Name}`}
          />
        )}
      </CardTitle>
      {type.Description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CardDescription className="text-xs truncate">
              {type.Description}
              {type.IsDefault && " · Always enabled"}
            </CardDescription>
          </TooltipTrigger>
          <TooltipContent>{type.Description}</TooltipContent>
        </Tooltip>
      )}
    </CardHeader>
  </Card>
);

const AvailableTaskTypeCard = ({ type, onToggle }: TaskTypeCardProps) => (
  <Card className="relative gap-2 rounded-lg py-4 shadow-none h-full">
    <CardHeader className="px-4 gap-1">
      <CardTitle className="font-medium flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 min-w-0">
          <DynamicIcon
            name={type.Icon as any}
            className={cn(
              "size-4 shrink-0 opacity-50",
              stageStrokeClass(type.Color),
            )}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate text-muted-foreground">
                {type.Name || "Untitled Type"}
              </span>
            </TooltipTrigger>
            {type.Name && <TooltipContent>{type.Name}</TooltipContent>}
          </Tooltip>
        </span>

        <Switch
          checked={false}
          onCheckedChange={(checked) => onToggle(type, checked)}
          aria-label={`Toggle ${type.Name}`}
        />
      </CardTitle>
      {type.Description && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CardDescription className="text-xs truncate">
              {type.Description}
            </CardDescription>
          </TooltipTrigger>
          <TooltipContent>{type.Description}</TooltipContent>
        </Tooltip>
      )}
    </CardHeader>
  </Card>
);

export function ProjectTaskTypesTab({ projectId }: { projectId: number }) {
  const { data, isFetching } = useProjectTaskTypeSettingsQuery(projectId);
  const { setEnabledTypes } = useProjectTaskTypesMutation(projectId);

  // null = no pending local override, fall back to server data
  const [localEnabledIds, setLocalEnabledIds] = useState<number[] | null>(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        {isFetching ? "Loading task types..." : "No task types found."}
      </div>
    );
  }

  const enabledIds = localEnabledIds ?? data.EnabledTypeIDs;

  const handleToggle = (type: TaskType, checked: boolean) => {
    const next = checked
      ? [...enabledIds, type.ID]
      : enabledIds.filter((id) => id !== type.ID);

    setLocalEnabledIds(next);

    setEnabledTypes.mutate(next, {
      onError: () => {
        setLocalEnabledIds(null);
        toast.error("Failed to update type settings.");
      },
    });
  };

  const enabledTypes = data.AllTypes.filter((t) => enabledIds.includes(t.ID));
  const availableTypes = data.AllTypes.filter(
    (t) => !enabledIds.includes(t.ID),
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Task Types</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Choose which types are available when creating tasks in this project.
          The default type is always enabled.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Enabled</h3>
        {enabledTypes.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
            No types are enabled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence initial={false}>
              {enabledTypes.map((type) => (
                <motion.div key={type.ID} {...enabledVariants}>
                  <TaskTypeCard type={type} onToggle={handleToggle} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Available</h3>
        {availableTypes.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
            All types are enabled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence initial={false}>
              {availableTypes.map((type) => (
                <motion.div key={type.ID} {...availableVariants}>
                  <AvailableTaskTypeCard type={type} onToggle={handleToggle} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
