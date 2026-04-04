import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function CollapsibleSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleContent className="flex flex-col gap-2 pb-2">
        {children}
      </CollapsibleContent>

      <div className="relative flex items-center gap-5">
        <Separator className="flex-1" />
        <CollapsibleTrigger asChild>
          <Button
            variant="link"
            className="inline-flex shrink-0 text-xs text-neutral-500 py-1 w-fit justify-center"
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
            Show
            {expanded ? " less " : " more "}
            fields
          </Button>
        </CollapsibleTrigger>
        <Separator className="flex-1" />
      </div>
    </Collapsible>
  );
}
