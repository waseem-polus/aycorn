import { cn } from "@/lib/utils";
import type { FocusEventHandler } from "react";

export function EditableHeader({
  value = "",
  setValue = () => {},
  placeholder = "",
  className = "",
  onBlur = () => {},
}: {
  value?: string;
  setValue?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: FocusEventHandler<HTMLHeadElement>;
}) {
  return (
    <h1
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "ce-placeholder outline-0 border border-transparent font-normal text-2xl md:text-2xl text-wrap min-h-8 leading-tight focus:outline-none ",
        className,
      )}
      onBlur={(e) => {
        setValue(e.target.textContent ?? "");
        onBlur(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
        }
      }}
    >
      {value}
    </h1>
  );
}
