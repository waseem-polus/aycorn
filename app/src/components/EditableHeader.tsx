import { cn } from "@/lib/utils";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type FocusEventHandler,
  type Ref,
} from "react";

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
  forwardedRef: Ref<HTMLHeadingElement>,
) {
  const innerRef = useRef<HTMLHeadingElement>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current!);

  // Set content on mount without giving React children to reconcile
  useLayoutEffect(() => {
    if (innerRef.current) {
      innerRef.current.textContent = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync external value changes only when the element isn't focused —
  // prevents React re-renders from overwriting what the user is typing
  useEffect(() => {
    const el = innerRef.current;
    if (!el || el === document.activeElement) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  return (
    <h1
      ref={innerRef}
      contentEditable
      spellCheck={false}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={cn(
        "ce-placeholder not-focus:hover:bg-accent dark:not-focus:hover:bg-accent/50 rounded-lg p-1 not-focus:hover:underline outline-0 border border-transparent font-normal text-2xl text-wrap min-h-8 leading-tight focus:outline-none text-foreground",
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
    />
  );
});
