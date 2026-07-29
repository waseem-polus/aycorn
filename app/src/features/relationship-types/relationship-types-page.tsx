import { LinkIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskRelationshipTypesQuery } from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { RelationshipTypeCard } from "@/features/relationship-types/relationship-type-card";

export function RelationshipTypesPage() {
  const { data: types = [], isLoading } = useTaskRelationshipTypesQuery();
  const { createRelationshipType } = useRelationshipTypeMutation();

  const handleCreate = () => {
    createRelationshipType.mutate(
      { fromName: "", toName: "", behavior: "link", icon: "link" },
      { onError: () => toast.error("Failed to create relationship type.") },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          disabled={createRelationshipType.isPending}
        >
          <PlusIcon />
          New Type
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : types.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-muted-foreground">
          <LinkIcon className="size-6" />
          <p className="text-sm">No relationship types yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <RelationshipTypeCard key={type.ID} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
