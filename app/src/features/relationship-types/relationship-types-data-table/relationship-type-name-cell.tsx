import { LockIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditableHeader } from "@/components/EditableHeader";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  type: TaskRelationshipType;
  field: "FromName" | "ToName";
  placeholder: string;
};

export function RelationshipTypeNameCell({ type, field, placeholder }: Props) {
  const { updateRelationshipTypeNames } = useRelationshipTypeMutation();
  const value = type[field];

  if (type.IsSystem) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block grow min-w-0 truncate text-sm cursor-not-allowed">{value}</span>
        </TooltipTrigger>
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

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex-1 min-w-0 h-full flex items-center"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <EditableHeader
            value={value}
            setValue={handleSave}
            placeholder={placeholder}
            className="w-full min-w-0 whitespace-normal wrap-break-word text-sm p-1 -m-1 font-normal cursor-text"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent align="start">{placeholder}</TooltipContent>
    </Tooltip>
  );
}
