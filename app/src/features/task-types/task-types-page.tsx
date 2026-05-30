import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { useTaskTypesQuery } from "@/features/task-types/queries/useTaskTypesQuery";
import { useTaskTypeMutation } from "@/features/task-types/queries/useTaskTypeMutation";
import { TaskTypeCard } from "@/features/task-types/task-type-card";

export function TaskTypesPage() {
  const [search, setSearch] = useState("");
  const { data: types = [], isFetching } = useTaskTypesQuery();
  const { createTaskType } = useTaskTypeMutation();

  const filtered = useMemo(
    () =>
      types.filter((t) =>
        t.Name.toLowerCase().includes(search.toLowerCase()),
      ),
    [types, search],
  );

  const handleCreate = () => {
    createTaskType.mutate(
      {},
      { onError: () => toast.error("Failed to create type.") },
    );
  };

  const isLoading = isFetching && types.length === 0;

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex gap-2 items-center flex-col md:flex-row">
        <InputGroup>
          <InputGroupInput
            placeholder="Search types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filtered.length} types
          </InputGroupAddon>
        </InputGroup>

        <div className="flex gap-2 justify-end w-full md:w-fit">
          <Button onClick={handleCreate} disabled={createTaskType.isPending}>
            <Plus />
            New Type
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          Loading types...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          {search ? "No types match your search." : "No task types yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0 overflow-y-auto content-start p-1">
          {filtered.map((type) => (
            <TaskTypeCard key={type.ID} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
