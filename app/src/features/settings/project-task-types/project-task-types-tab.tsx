import { useState } from "react";
import { LockIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
import { useEnableCategoryMutation } from "@/features/settings/project-task-types/queries/useEnableCategoryMutation";
import { toast } from "sonner";
import type { TaskTypeCategory, TaskTypeWithCount } from "@/types/types";
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
  type: TaskTypeWithCount;
  onToggle: (type: TaskTypeWithCount, checked: boolean) => void;
};

const EnabledTaskTypeCard = ({ type, onToggle }: TaskTypeCardProps) => (
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
      <CardDescription className="text-xs text-muted-foreground">
        {type.TaskCount === 1 ? "1 task" : `${type.TaskCount} tasks`}
        {type.IsDefault && " · Always enabled"}
      </CardDescription>
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
            <CardDescription className="text-xs truncate text-muted-foreground">
              {type.Description}
            </CardDescription>
          </TooltipTrigger>
          <TooltipContent>{type.Description}</TooltipContent>
        </Tooltip>
      )}
    </CardHeader>
  </Card>
);

type CategoryGroupProps = {
  category: TaskTypeCategory;
  types: TaskTypeWithCount[];
  onToggle: (type: TaskTypeWithCount, checked: boolean) => void;
  onEnableAll: (categoryId: number) => void;
  isEnablingAll: boolean;
};

const AvailableCategoryGroup = ({
  category,
  types,
  onToggle,
  onEnableAll,
  isEnablingAll,
}: CategoryGroupProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">
        {category.Name !== "" ? category.Name : "Untitled Category"}
        <span className="font-normal ml-1">({types.length})</span>
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 text-xs px-2"
        onClick={() => onEnableAll(category.ID)}
        disabled={isEnablingAll}
      >
        Enable all
      </Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <AnimatePresence initial={false}>
        {types.map((type) => (
          <motion.div key={type.ID} {...availableVariants}>
            <AvailableTaskTypeCard type={type} onToggle={onToggle} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

export function ProjectTaskTypesTab({ projectId }: { projectId: number }) {
  const { data, isFetching } = useProjectTaskTypeSettingsQuery(projectId);
  const { setEnabledTypes } = useProjectTaskTypesMutation(projectId);
  const enableCategory = useEnableCategoryMutation(projectId);

  const [localEnabledIds, setLocalEnabledIds] = useState<number[] | null>(null);

  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        {isFetching ? "Loading task types..." : "No task types found."}
      </div>
    );
  }

  const enabledIds = localEnabledIds ?? data.EnabledTypeIDs;

  const handleToggle = (type: TaskTypeWithCount, checked: boolean) => {
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

  const handleEnableCategory = (categoryId: number) => {
    enableCategory.mutate(categoryId, {
      onError: () => toast.error("Failed to enable category."),
    });
  };

  const enabledTypes = data.AllTypes.filter((t) => enabledIds.includes(t.ID));
  const availableTypes = data.AllTypes.filter(
    (t) => !enabledIds.includes(t.ID),
  );

  // Group available types by category, preserving category sort order.
  const availableByCategory = new Map<number, TaskTypeWithCount[]>();
  for (const type of availableTypes) {
    const bucket = availableByCategory.get(type.Category) ?? [];
    bucket.push(type);
    availableByCategory.set(type.Category, bucket);
  }
  const categoriesWithAvailable = data.Categories.filter((c) =>
    availableByCategory.has(c.ID),
  );
  const showCategoryHeaders = categoriesWithAvailable.length > 1;

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
        <h3 className="text-sm font-medium">
          Enabled{" "}
          <span className="text-muted-foreground font-normal">
            ({enabledTypes.length})
          </span>
        </h3>
        {enabledTypes.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
            No types are enabled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence initial={false}>
              {enabledTypes.map((type) => (
                <motion.div key={type.ID} {...enabledVariants}>
                  <EnabledTaskTypeCard type={type} onToggle={handleToggle} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Available{" "}
          <span className="font-normal">({availableTypes.length})</span>
        </h3>
        {availableTypes.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-8 text-sm text-muted-foreground">
            All types are enabled.
          </div>
        ) : showCategoryHeaders ? (
          <div className="flex flex-col gap-6">
            {categoriesWithAvailable.map((category) => (
              <AvailableCategoryGroup
                key={category.ID}
                category={category}
                types={availableByCategory.get(category.ID) ?? []}
                onToggle={handleToggle}
                onEnableAll={handleEnableCategory}
                isEnablingAll={enableCategory.isPending}
              />
            ))}
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
