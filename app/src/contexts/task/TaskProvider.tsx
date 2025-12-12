import { useState } from "react";
import { defaultTaskContextValue, TaskContext } from "./TaskContext";
import type { ChecklistTask } from "@/types/types";

export function TaskProvider({
  defaultState = defaultTaskContextValue.state,
  children,
}: {
  defaultState?: ChecklistTask;
  children: React.ReactNode;
}) {
  const [task, setTask] = useState<ChecklistTask>(defaultState);

  return (
    <TaskContext.Provider value={{ state: task, setState: setTask }}>
      {children}
    </TaskContext.Provider>
  );
}
