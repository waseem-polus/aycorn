import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/useMobile";

export type BasicFilterRow = {
  value: string;
  label: string;
  /** Right-aligned state, e.g. "Any", "Aycorn Web", "2 active". */
  summary: string;
  content: ReactNode;
};

type Props = {
  rows: BasicFilterRow[];
  /** Total active basic filters, summarised on the single mobile row. */
  activeCount: number;
};

/**
 * The basic filters, collapsed into accordion rows so the condition builder
 * below gets the room. On mobile the rows nest under a single "Basic filters"
 * row to keep the conditions above the fold.
 */
export function BasicFiltersAccordion({ rows, activeCount }: Props) {
  const isMobile = useIsMobile();

  const list = (
    <Accordion type="multiple" className="rounded-lg border bg-background">
      {rows.map((row) => (
        <AccordionItem key={row.value} value={row.value} className="px-3">
          <AccordionTrigger className="items-center py-3 hover:no-underline">
            <span>{row.label}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-auto max-w-1/2 truncate font-normal text-muted-foreground">
                  {row.summary}
                </span>
              </TooltipTrigger>
              <TooltipContent>{row.summary}</TooltipContent>
            </Tooltip>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">{row.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );

  if (!isMobile) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Basic filters</span>
        {list}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="rounded-lg border bg-background">
      <AccordionItem value="basic" className="px-3">
        <AccordionTrigger className="items-center py-3 hover:no-underline">
          <span>Basic filters</span>
          <span className="ml-auto font-normal text-muted-foreground">
            {activeCount > 0 ? `${activeCount} active` : "Any"}
          </span>
        </AccordionTrigger>
        <AccordionContent>{list}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
