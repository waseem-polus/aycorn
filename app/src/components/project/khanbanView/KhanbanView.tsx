import { KhanbanColumn } from "./KhanbanColumn";

export function KhanbanView() {
  return (
    <div className="div flex gap-2">
      <KhanbanColumn status="Blocked" description="Tasks cannot be started" />
      <KhanbanColumn status="Open" description="Tasks are being planned" />
      <KhanbanColumn status="Todo" description="Tasks are ready to start" />
      <KhanbanColumn status="Doing" description="Tasks are being worked on" />
      <KhanbanColumn status="Done" description="Tasks are completed" />
    </div>
  );
}
