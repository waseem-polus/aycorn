import { Link2Icon } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { stageStrokeClass } from "@/features/stage/stage-visual";
import type { PropertyIconSpec } from "@/features/task-filters/conditions/condition-properties";
import { cn } from "@/lib/utils";

/** A property's icon: a registry icon, or a relationship type's own icon in its color. */
export function PropertyIcon({ icon, className }: { icon: PropertyIconSpec; className?: string }) {
  if ("color" in icon) {
    return (
      <DynamicIcon
        name={icon.name as IconName}
        className={cn(className, stageStrokeClass(icon.color))}
        fallback={() => <Link2Icon className={className} />}
      />
    );
  }
  const Icon = icon;
  return <Icon className={cn("text-muted-foreground", className)} />;
}
