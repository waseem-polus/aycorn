import * as React from "react";

import {
  useEquationElement,
  useEquationInput,
} from "@platejs/math/react";
import type { TEquationElement } from "platejs";
import type { PlateElementProps } from "platejs/react";
import { PlateElement, useReadOnly } from "platejs/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function EquationElement(props: PlateElementProps<TEquationElement>) {
  const { children, element } = props;
  const readOnly = useReadOnly();
  const [open, setOpen] = React.useState(false);
  const katexRef = React.useRef<HTMLDivElement>(null);

  useEquationElement({ element, katexRef, options: { throwOnError: false } });

  const { onSubmit, props: inputProps, ref: inputRef } = useEquationInput({
    isInline: false,
    open,
    onClose: () => setOpen(false),
  });

  const display = (
    <div
      className={cn(
        "flex min-h-12 w-full items-center justify-center rounded-sm bg-muted p-3",
        !readOnly && "cursor-pointer hover:bg-muted/70",
        !element.texExpression && "text-muted-foreground",
      )}
      contentEditable={false}
    >
      {element.texExpression ? (
        <div ref={katexRef} />
      ) : (
        <span className="text-sm">Click to add equation</span>
      )}
    </div>
  );

  return (
    <PlateElement {...props} className="my-4">
      {readOnly ? (
        display
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{display}</PopoverTrigger>
          <PopoverContent className="w-80 space-y-2">
            <Textarea
              {...inputProps}
              ref={inputRef}
              className="min-h-24 font-mono text-sm"
              placeholder="Enter LaTeX, e.g. E = mc^2"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={onSubmit}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      {children}
    </PlateElement>
  );
}

export function InlineEquationElement(
  props: PlateElementProps<TEquationElement>,
) {
  const { children, element } = props;
  const readOnly = useReadOnly();
  const [open, setOpen] = React.useState(false);
  const katexRef = React.useRef<HTMLSpanElement>(null);

  useEquationElement({ element, katexRef: katexRef as any, options: { throwOnError: false } });

  const { onSubmit, props: inputProps, ref: inputRef } = useEquationInput({
    isInline: true,
    open,
    onClose: () => setOpen(false),
  });

  const display = (
    <span
      className={cn(
        "rounded-sm bg-muted px-1 align-middle",
        !readOnly && "cursor-pointer hover:bg-muted/70",
        !element.texExpression && "text-muted-foreground",
      )}
      contentEditable={false}
    >
      {element.texExpression ? (
        <span ref={katexRef} />
      ) : (
        <span className="text-sm">equation</span>
      )}
    </span>
  );

  return (
    <PlateElement {...props} as="span" className="inline">
      {readOnly ? (
        display
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{display}</PopoverTrigger>
          <PopoverContent className="w-72 space-y-2">
            <Textarea
              {...inputProps}
              ref={inputRef}
              className="min-h-16 font-mono text-sm"
              placeholder="Enter LaTeX, e.g. x^2 + y^2"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={onSubmit}>
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
      {children}
    </PlateElement>
  );
}
