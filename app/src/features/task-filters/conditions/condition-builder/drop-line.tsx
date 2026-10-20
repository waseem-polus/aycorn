import { cn } from "@/lib/utils";

/** The insertion marker shown where a dragged node will land. */
export function DropLine({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 flex items-center",
        edge === "top" ? "-top-1.5" : "-bottom-1.5",
      )}
    >
      <span className="size-2 rounded-full bg-primary" />
      <span className="h-0.5 flex-1 bg-primary" />
    </div>
  );
}
