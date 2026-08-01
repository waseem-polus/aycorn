import { useState } from "react";
import { PlusIcon, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { RelationshipTypesDataTable } from "@/features/relationship-types/relationship-types-data-table";
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
            New Link
          </Button>
        </div>
      </div>

      <RelationshipTypesDataTable
        data={types}
        isFetching={isFetching}
        emptyMessage={
          search || behaviorFilter !== "all"
            ? "No relationship types match your search."
            : "No relationship types yet"
        }
      />
    </div>
  );
}
