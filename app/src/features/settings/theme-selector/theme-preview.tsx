import { PreviewSurface } from "@/features/settings/theme-selector/preview-surface";

type Props = {
  variant: "light" | "dark" | "system";
};

export function ThemePreview({ variant }: Props) {
  if (variant === "system") {
    return (
      <div className="relative h-20 w-full overflow-hidden rounded-md border">
        <div className="absolute inset-0 grid grid-cols-2">
          <PreviewSurface mode="light" />
          <PreviewSurface mode="dark" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative h-20 w-full overflow-hidden rounded-md border">
      <PreviewSurface mode={variant} />
    </div>
  );
}
