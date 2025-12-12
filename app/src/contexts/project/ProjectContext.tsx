import type { Project } from "@/types/types";
import { createContext } from "react";

export type ProjectContextType = {
  state: Project;
  setState: (task: Project) => void;
};

export const defaultProjectContextValue: ProjectContextType = {
  state: {
    ID: 0,
    Name: "",
    Pinned: false,
  },
  setState: () => {},
};

export const ProjectContext = createContext<ProjectContextType>(
  defaultProjectContextValue,
);
