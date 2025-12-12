import { useState } from "react";
import type { Project } from "@/types/types";
import { defaultProjectContextValue, ProjectContext } from "./ProjectContext";

export function ProjectProvider({
  defaultState = defaultProjectContextValue.state,
  children,
}: {
  defaultState?: Project;
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<Project>(defaultState);

  return (
    <ProjectContext.Provider value={{ state: project, setState: setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
