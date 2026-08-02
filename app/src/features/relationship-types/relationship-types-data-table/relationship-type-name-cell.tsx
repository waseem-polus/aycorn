import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableHeader } from "@/components/EditableHeader";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { cn } from "@/lib/utils";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
  field: "FromName" | "ToName";
  placeholder: string;
  showTooltip?: boolean;
  /** When false, the name renders at its natural width on one line instead of
   * wrapping/truncating within its own box — used when the caller's own
   * container wraps the whole name as a unit (e.g. the mobile inline layout). */
  wrap?: boolean;
};

export function RelationshipTypeNameCell({
  type,
  field,
  placeholder,
  showTooltip = true,
  wrap = true,
}: Props) {
  const { updateRelationshipTypeNames } = useRelationshipTypeMutation();
  const value = type[field];

  if (type.IsSystem) {
    const content = (
      <span
        className={cn(
          "block text-sm cursor-not-allowed",
          wrap ? "grow min-w-0 truncate" : "shrink-0 whitespace-nowrap",
        )}
      >
        {value}
      </span>
    );
    if (!showTooltip) return content;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent align="start">
          <div className="flex flex-col gap-0.5">
            <span>{placeholder}</span>
            <span className="flex items-center gap-1 text-background/70">
              <LockIcon className="size-2.5 shrink-0" />
              System relationship types cannot be edited or deleted
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleSave = (next: string) => {
    if (next === value) return;
    updateRelationshipTypeNames.mutate(
      {
        id: type.ID,
        fromName: field === "FromName" ? next : type.FromName,
        toName: field === "ToName" ? next : type.ToName,
      },
      { onError: () => toast.error("Failed to update name.") },
    );
  };

  const editable = (
    <div
      className={cn(
        "h-full flex items-center",
        wrap ? "flex-1 min-w-0" : "shrink-0",
      )}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <EditableHeader
        value={value}
        setValue={handleSave}
        placeholder={placeholder}
        className={cn(
          "text-sm p-1 -m-1 font-normal cursor-text",
          wrap
            ? "w-full min-w-0 whitespace-normal wrap-break-word"
            : "w-auto whitespace-nowrap",
        )}
      />
    </div>
  );
  if (!showTooltip) return editable;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{editable}</TooltipTrigger>
      <TooltipContent align="start">{placeholder}</TooltipContent>
    </Tooltip>
  );
}
