import { useState } from "react";
import { defaultTaskContextValue, TaskContext } from "./TaskContext";
import type { Task } from "@/types/types";

export function TaskProvider({
  defaultState = defaultTaskContextValue.state,
  children,
}: {
  defaultState?: Task;
  children: React.ReactNode;
}) {
  const [task, setTask] = useState<Task>(defaultState);

  return (
    <TaskContext.Provider value={{ state: task, setState: setTask }}>
      {children}
    </TaskContext.Provider>
  );
}
