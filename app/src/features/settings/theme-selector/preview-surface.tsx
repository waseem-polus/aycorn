import { cn } from "@/lib/utils";

type Props = {
  mode: "light" | "dark";
};

export function PreviewSurface({ mode }: Props) {
  const isDark = mode === "dark";
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col gap-1.5 p-2",
        isDark ? "bg-neutral-900" : "bg-white",
      )}
    >
      <div
        className={cn(
          "h-1.5 w-8 rounded-full",
          isDark ? "bg-neutral-700" : "bg-neutral-200",
        )}
      />
      <div
        className={cn(
          "h-1.5 w-12 rounded-full",
          isDark ? "bg-neutral-700" : "bg-neutral-200",
        )}
      />
      <div
        className={cn(
          "mt-auto h-3 w-10 rounded-sm",
          isDark ? "bg-neutral-600" : "bg-neutral-300",
        )}
      />
    </div>
  );
}
