import { useContext } from "react";
import { RelativeTimeWithTooltip } from "@/components/relative-time-with-tooltip";
import { ProjectContext } from "@/contexts/project/ProjectContext";

export function ProjectHeader() {
  const { Project } = useContext(ProjectContext);

  return (
    <RelativeTimeWithTooltip
      className="hidden sm:flex"
      date={Project.TimeModified}
      label="Modified"
    />
  );
}
