import type { PlateElementProps } from "platejs/react";

import { useBlockSelectable } from "@platejs/selection/react";
import { PlateElement } from "platejs/react";

import { cn } from "@/lib/utils";

export function ParagraphElement(props: PlateElementProps) {
  const { props: selectableProps } = useBlockSelectable();
  return (
    <PlateElement {...props} {...selectableProps} className={cn("m-0 px-0 py-1", selectableProps.className)}>
      {props.children}
    </PlateElement>
  );
}
