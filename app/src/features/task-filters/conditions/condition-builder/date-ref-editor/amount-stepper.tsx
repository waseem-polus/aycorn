import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Enter in the field, e.g. to apply and close. */
  onEnter: () => void;
};

/** A whole number typed in place, or nudged with −/+ or the arrow keys. */
export function AmountStepper({ value, min, max, onChange, onEnter }: Props) {
  // The typed text while the field has focus, so it can be briefly empty.
  const [text, setText] = useState<string | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const step = (delta: number) => {
    setText(null);
    onChange(clamp(value + delta));
  };

  const handleTextChange = (raw: string) => {
    setText(raw);
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) onChange(clamp(n));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      step(e.key === "ArrowUp" ? 1 : -1);
    }
  };

  return (
    <InputGroup className="h-8">
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          size="icon-xs"
          aria-label="Decrease"
          tabIndex={-1}
          disabled={value <= min}
          onClick={() => step(-1)}
        >
          <MinusIcon />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        inputMode="numeric"
        aria-label="Amount"
        className="text-center tabular-nums"
        value={text ?? String(value)}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={() => setText(null)}
        onKeyDown={handleKeyDown}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label="Increase"
          tabIndex={-1}
          disabled={value >= max}
          onClick={() => step(1)}
        >
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
