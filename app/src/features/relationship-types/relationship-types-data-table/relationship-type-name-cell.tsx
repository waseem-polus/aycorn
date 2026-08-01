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
          <span className="block grow min-w-0 truncate text-sm">{value}</span>
        </TooltipTrigger>
        <TooltipContent>
          System relationship types cannot be edited or deleted
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
    <div
      className="min-w-0 h-full"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <EditableHeader
        value={value}
        setValue={handleSave}
        placeholder={placeholder}
        className="w-full h-full flex items-center text-sm p-1 -m-1 font-normal cursor-text"
      />
    </div>
  );
}
