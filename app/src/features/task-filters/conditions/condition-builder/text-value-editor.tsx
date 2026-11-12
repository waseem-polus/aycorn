import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useEditKeys } from "@/hooks/useEditKeys";

type Props = {
  text: string;
  autoFocus: boolean;
  onChange: (text: string) => void;
};

/** Commit delay — long enough that typing doesn't refetch on every keystroke. */
const DEBOUNCE_MS = 300;

/**
 * Free text for contains / does not contain. Edits are held locally and
 * committed after a pause in typing (or immediately on blur), since every
 * commit changes the query and refetches.
 */
export function TextValueEditor({ text, autoFocus, onChange }: Props) {
  const [draft, setDraft] = useState(text);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick up outside changes (undo, duplicate) without clobbering typing.
  useEffect(() => {
    if (!timer.current) setDraft(text);
  }, [text]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const commit = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (value !== text) onChange(value);
  };

  const inputRef = useEditKeys({ onEnter: () => commit(draft) });

  return (
    <Input
      ref={inputRef}
      value={draft}
      autoFocus={autoFocus}
      placeholder="Type some text…"
      onChange={(e) => {
        const value = e.target.value;
        setDraft(value);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => commit(value), DEBOUNCE_MS);
      }}
      onBlur={() => commit(draft)}
    />
  );
}
