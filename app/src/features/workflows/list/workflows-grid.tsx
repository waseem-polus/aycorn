import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowSummary } from "@/types/types";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { WorkflowCard } from "@/features/workflows/list/workflow-card";
import { useWorkflowMutation } from "@/features/workflows/shared/queries/useWorkflowMutation";

type FilterTab = "all" | "in-use" | "unused";

export function WorkflowsGrid({
  workflows,
  isFetching,
}: {
  workflows: WorkflowSummary[];
  isFetching: boolean;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const navigate = useNavigate();
  const { createWorkflow } = useWorkflowMutation();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (newId) => {
        navigate({
          to: "/workflow/$workflowId",
          params: { workflowId: String(newId) },
          search: { new: true },
        });
      },
      onError: () => toast.error("Failed to create workflow."),
    });
  };

  const filtered = useMemo(() => {
    return workflows.filter((w) =>
      w.Name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [workflows, search]);

  const isLoading = isFetching && workflows.length === 0;
  const hasResults = filtered.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <InputGroup>
          <InputGroupInput
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {filtered.length} workflows
          </InputGroupAddon>
        </InputGroup>

        {/* TODO: apply In Use / Unused filter via ProjectCount */}
        <ToggleGroup
          type="single"
          variant="outline"
          value={tab}
          onValueChange={(value) => {
            if (value) setTab(value as FilterTab);
          }}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="in-use">In Use</ToggleGroupItem>
          <ToggleGroupItem value="unused">Unused</ToggleGroupItem>
        </ToggleGroup>

        <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
          <Plus />
          New Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          Loading workflows...
        </div>
      ) : !hasResults ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-muted-foreground">
          {search ? "No workflows match your search." : "No workflows yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((workflow) => (
            <WorkflowCard key={workflow.ID} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}
