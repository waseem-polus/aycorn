import { Label } from "@/components/ui/label";

export function TaskProperty({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Label htmlFor={htmlFor} className="min-w-1/7 text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
