import { useEffect, useState } from "react";
import { LockIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { stageStrokeClass } from "@/features/stage/stage-palette";
import { useProjectTaskTypeSettingsQuery } from "@/features/settings/project-task-types/queries/useProjectTaskTypeSettingsQuery";
import { useProjectTaskTypesMutation } from "@/features/settings/project-task-types/queries/useProjectTaskTypesMutation";
import { toast } from "sonner";
import type { TaskType } from "@/types/types";
import { cn } from "@/lib/utils";

export function ProjectTaskTypesTab({ projectId }: { projectId: number }) {
  const { data, isFetching } = useProjectTaskTypeSettingsQuery(projectId);
  const { setEnabledTypes } = useProjectTaskTypesMutation(projectId);

  const [enabledIds, setEnabledIds] = useState<number[]>([]);

  useEffect(() => {
    if (data) setEnabledIds(data.EnabledTypeIDs);
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
        {isFetching ? "Loading task types..." : "No task types found."}
      </div>
    );
  }

  const handleToggle = (type: TaskType, checked: boolean) => {
    const next = checked
      ? [...enabledIds, type.ID]
      : enabledIds.filter((id) => id !== type.ID);

    setEnabledIds(next);

    setEnabledTypes.mutate(next, {
      onError: () => {
        setEnabledIds(data.EnabledTypeIDs);
        toast.error("Failed to update type settings.");
      },
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">Task Types</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Choose which types are available when creating tasks in this project.
          The default type is always enabled.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.AllTypes.map((type) => {
          const enabled = enabledIds.includes(type.ID);
          return (
            <Card
              key={type.ID}
              className="relative gap-2 rounded-lg py-4 shadow-none"
            >
              <CardHeader className="px-4 gap-1">
                <CardTitle className="font-medium flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <DynamicIcon
                      name={type.Icon as any}
                      className={cn(
                        "size-4 shrink-0",
                        stageStrokeClass(type.Color),
                      )}
                    />
                    <span className="truncate">
                      {type.Name || "Untitled Type"}
                    </span>
                  </span>

                  {type.IsDefault ? (
                    <LockIcon className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => handleToggle(type, checked)}
                      aria-label={`Toggle ${type.Name}`}
                    />
                  )}
                </CardTitle>
                {type.Description && (
                  <CardDescription className="text-xs truncate">
                    {type.Description} . {type.IsDefault && "Always enabled"}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
