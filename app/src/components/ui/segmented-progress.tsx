import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SegmentedProgressVariant = "pills" | "blocks" | "labeled";

type SegmentedProgressSegment = {
  count: number;
  className: string;
  label?: string;
};

type SegmentedProgressProps = React.ComponentProps<"div"> & {
  segments: SegmentedProgressSegment[];
  variant?: SegmentedProgressVariant;
};

function SegmentedProgress({
  segments,
  variant = "pills",
  className,
  ...props
}: SegmentedProgressProps) {
  const visibleSegments = segments.filter((segment) => segment.count > 0);
  const totalCount = visibleSegments.reduce(
    (sum, segment) => sum + segment.count,
    0,
  );

  const defaultHeight = variant === "labeled" ? "h-7" : "h-2";

  const segmentRounding = (isFirst: boolean, isLast: boolean) => {
    if (isFirst && isLast) return "rounded-md";
    if (isFirst) return "rounded-l-md rounded-r-sm";
    if (isLast) return "rounded-l-sm rounded-r-md";
    return "rounded-sm";
  };

  return (
    <div
      data-slot="segmented-progress"
      className={cn(
        "flex w-full items-center gap-0.5",
        defaultHeight,
        className,
      )}
      {...props}
    >
      {totalCount === 0 ? (
        <div className="bg-muted h-full flex-1 rounded-md text-xs text-muted-foreground grid place-content-center">
          No tasks yet
        </div>
      ) : variant === "pills" ? (
        visibleSegments.map((segment, segmentIndex) => {
          const tooltipContent = segment.label
            ? `${segment.label} · ${segment.count}`
            : String(segment.count);
          const isFirstSegment = segmentIndex === 0;
          const isLastSegment = segmentIndex === visibleSegments.length - 1;

          return (
            <Tooltip key={segmentIndex}>
              <TooltipTrigger asChild>
                <div
                  className="flex h-full items-center gap-0.5"
                  style={{ flexGrow: segment.count, flexBasis: 0 }}
                >
                  {Array.from({ length: segment.count }).map((_, cellIndex) => {
                    const isFirstCell = isFirstSegment && cellIndex === 0;
                    const isLastCell =
                      isLastSegment && cellIndex === segment.count - 1;
                    return (
                      <div
                        key={cellIndex}
                        className={cn(
                          "h-full flex-1",
                          segmentRounding(isFirstCell, isLastCell),
                          segment.className,
                        )}
                      />
                    );
                  })}
                </div>
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          );
        })
      ) : variant === "blocks" ? (
        visibleSegments.map((segment, segmentIndex) => {
          const tooltipContent = segment.label
            ? `${segment.label} · ${segment.count}`
            : String(segment.count);
          const isFirst = segmentIndex === 0;
          const isLast = segmentIndex === visibleSegments.length - 1;

          return (
            <Tooltip key={segmentIndex}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-full",
                    segmentRounding(isFirst, isLast),
                    segment.className,
                  )}
                  style={{ flexGrow: segment.count, flexBasis: 0 }}
                />
              </TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          );
        })
      ) : (
        visibleSegments.map((segment, segmentIndex) => {
          const tooltipContent = segment.label
            ? `${segment.label} · ${segment.count}`
            : String(segment.count);
          const isFirst = segmentIndex === 0;
          const isLast = segmentIndex === visibleSegments.length - 1;

          return (
            <div
              key={segmentIndex}
              className={cn(
                "flex h-full min-w-0 items-center gap-1 overflow-hidden px-2",
                segmentRounding(isFirst, isLast),
                segment.className,
              )}
              style={{ flexGrow: segment.count, flexBasis: 0 }}
            >
              {segment.label ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="min-w-0 flex-1 truncate text-xs leading-none">
                        {segment.label}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipContent}</TooltipContent>
                  </Tooltip>
                  <span className="shrink-0 text-xs leading-none">
                    {segment.count}
                  </span>
                </>
              ) : (
                <span className="mx-auto shrink-0 text-xs leading-none">
                  {segment.count}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export { SegmentedProgress };
export type {
  SegmentedProgressSegment,
  SegmentedProgressProps,
  SegmentedProgressVariant,
};
