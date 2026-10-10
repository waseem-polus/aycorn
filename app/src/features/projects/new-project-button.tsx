import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectMenu } from "@/features/projects/create-project-menu";

export function NewProjectButton() {
  return (
    <CreateProjectMenu
      navigateOnCreate
      renderTrigger={({ onClick, disabled }) => (
        <Button
          className="hover:cursor-pointer"
          disabled={disabled}
          onClick={onClick}
        >
          <Plus />
          New Project
        </Button>
      )}
    />
  );
}
