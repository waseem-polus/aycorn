import { DndPlugin } from "@platejs/dnd";
import { useBlockSelectable, useBlockSelected } from "@platejs/selection/react";
import { cva } from "class-variance-authority";
import { type PlateElementProps, usePluginOption } from "platejs/react";

export const blockSelectionVariants = cva(
  "pointer-events-none absolute inset-0 z-1 bg-primary/15 ring-1 ring-inset ring-primary rounded-xs transition-opacity",
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: "opacity-0",
        true: "opacity-100",
      },
    },
  },
);

export function BlockSelection(props: PlateElementProps) {
  const { props: selectableProps } = useBlockSelectable();
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginOption(DndPlugin, "isDragging");

  if (
    !selectableProps.className ||
    props.plugin.key === "tr" ||
    props.plugin.key === "table"
  )
    return null;

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected && !isDragging,
      })}
      data-slot="block-selection"
    />
  );
}
