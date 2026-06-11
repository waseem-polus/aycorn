import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SegmentedProgressSegment = {
  count: number;
  className: string;
  label?: string;
};

type SegmentedProgressProps = React.ComponentProps<"div"> & {
  segments: SegmentedProgressSegment[];
};

function SegmentedProgress({
  segments,
  className,
  ...props
}: SegmentedProgressProps) {
  const visibleSegments = segments.filter((segment) => segment.count > 0);
  const totalCount = visibleSegments.reduce(
    (sum, segment) => sum + segment.count,
    0,
  );

  return (
    <div
      data-slot="segmented-progress"
      className={cn(
        "flex h-2 w-full items-center gap-0.5 overflow-hidden",
        className,
      )}
      {...props}
    >
      {totalCount === 0 ? (
        <div className="bg-muted h-full flex-1 rounded-full" />
      ) : (
        visibleSegments.map((segment, segmentIndex) => {
          const tooltipContent = segment.label
            ? `${segment.label} · ${segment.count}`
            : String(segment.count);

          return (
            <Tooltip key={segmentIndex}>
              <TooltipTrigger asChild>
                <div
                  className="flex h-full items-center gap-0.5"
                  style={{ flexGrow: segment.count, flexBasis: 0 }}
                >
                  {Array.from({ length: segment.count }).map((_, cellIndex) => {
                    return (
                      <div
                        key={cellIndex}
                        className={cn(
                          "h-full flex-1 rounded-sm",
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
      )}
    </div>
  );
}

export { SegmentedProgress };
export type { SegmentedProgressSegment, SegmentedProgressProps };
