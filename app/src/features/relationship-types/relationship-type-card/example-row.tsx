import { ArrowRightIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  sourceLetter: string;
  targetLetter: string;
  value: string;
  placeholder: string;
};

export function ExampleRow({
  sourceLetter,
  targetLetter,
  value,
  placeholder,
}: Props) {
  return (
    <div className="flex items-center gap-1.5 min-w-0 text-sm">
      <Avatar className="size-5">
        <AvatarFallback className="text-[10px] font-medium">
          {sourceLetter}
        </AvatarFallback>
      </Avatar>
      <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
      <span className="italic text-muted-foreground truncate">
        {value || placeholder}
      </span>
      <ArrowRightIcon className="size-3 shrink-0 text-muted-foreground" />
      <Avatar className="size-5">
        <AvatarFallback className="text-[10px] font-medium">
          {targetLetter}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
