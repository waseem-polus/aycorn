import { useState } from "react";
import { LinkIcon, PlusIcon, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useTaskRelationshipTypesQuery,
  type RelationshipBehaviorFilter,
} from "@/features/task/relationships/queries/useTaskRelationshipTypesQuery";
import { useRelationshipTypeMutation } from "@/features/relationship-types/queries/useRelationshipTypeMutation";
import { RelationshipTypeCard } from "@/features/relationship-types/relationship-type-card";
import { useDebounce } from "@/hooks/use-debounce";

export function RelationshipTypesPage() {
  const [search, setSearch] = useState("");
  const [behaviorFilter, setBehaviorFilter] =
    useState<RelationshipBehaviorFilter>("all");
  const debouncedSearch = useDebounce(search);
  const { data: types = [], isFetching } = useTaskRelationshipTypesQuery(
    debouncedSearch,
    behaviorFilter,
  );
  const isLoading = isFetching && types.length === 0;
  const { createRelationshipType } = useRelationshipTypeMutation();

  const handleCreate = () => {
    createRelationshipType.mutate(
      { fromName: "", toName: "", behavior: "link", icon: "link" },
      { onError: () => toast.error("Failed to create relationship type.") },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-col md:flex-row">
        <InputGroup>
          <InputGroupInput
            placeholder="Search relationship types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {types.length} types
          </InputGroupAddon>
        </InputGroup>

        <div className="flex gap-2 justify-between sm:justify-end w-full md:w-fit">
          <ToggleGroup
            type="single"
            variant="outline"
            value={behaviorFilter}
            onValueChange={(v) => {
              if (v) setBehaviorFilter(v as RelationshipBehaviorFilter);
            }}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="blocking">Blocking</ToggleGroupItem>
            <ToggleGroupItem value="subtask">Subtask</ToggleGroupItem>
            <ToggleGroupItem value="link">Link</ToggleGroupItem>
          </ToggleGroup>
          <Button
            onClick={handleCreate}
            disabled={createRelationshipType.isPending}
          >
            <PlusIcon />
            New Type
          </Button>
        </div>
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
          <p className="text-sm">
            {search || behaviorFilter !== "all"
              ? "No relationship types match your search."
              : "No relationship types yet"}
          </p>
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
