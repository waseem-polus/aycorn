import { useContext, useEffect } from "react";
import { ProjectContext } from "@/contexts/project/ProjectContext";
import { useProjectDetailsQuery } from "@/queries/useProjectDetailsQuery";
import { EMPTY_FILTERS } from "@/features/task-filters/task-filters";

export function UpcomingProjectDetailsLoader({
  projectId,
  open,
}: {
  projectId: number;
  open: boolean;
}) {
  const { SetProject, SetStages, SetChecklists, SetWorkflow } = useContext(ProjectContext);
  const { data } = useProjectDetailsQuery(projectId, EMPTY_FILTERS, open);

  useEffect(() => {
    if (!data) return;
    SetProject(data.Project);
    SetWorkflow(data.Workflow);
    SetStages(data.Stages);
    SetChecklists(data.Checklists);
  }, [data, SetProject, SetWorkflow, SetStages, SetChecklists]);

  return null;
}
