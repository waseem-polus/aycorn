import { cn } from "@/lib/utils";
import { forwardRef, type FocusEventHandler, type Ref } from "react";

export const EditableHeader = forwardRef(function (
  {
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
  },
  ref: Ref<HTMLHeadingElement>,
) {
  return (
    <h1
      contentEditable
      spellCheck={false}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "ce-placeholder not-focus:hover:bg-accent rounded-lg p-1 not-focus:hover:underline outline-0 border border-transparent font-normal text-2xl text-wrap min-h-8 leading-tight focus:outline-none text-primary",
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
      ref={ref}
    >
      {value}
    </h1>
  );
});
