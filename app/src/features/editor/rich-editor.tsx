import { Plate, usePlateEditor } from "platejs/react";

import { BasicNodesKit } from "@/features/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { BaseCalloutKit } from "@/features/editor/plugins/callout-base-kit";
import { CalloutKit } from "@/features/editor/plugins/callout-kit";
import { IndentKit } from "@/features/editor/plugins/indent-kit";
import { BaseToggleKit } from "@/features/editor/plugins/toggle-base-kit";
import { ToggleKit } from "@/features/editor/plugins/toggle-kit";
import { SlashKit } from "@/features/editor/plugins/slash-kit";
import { EmojiKit } from "@/features/editor/plugins/emoji-kit";
import { FloatingToolbarKit } from "./plugins/floating-toolbar-kit";
import { DndKit } from "./plugins/dnd-kit";
import { ListKit } from "./plugins/list-kit";
import { AutoformatKit } from "./plugins/autoformat-kit";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";
import type { Value } from "platejs";
import { CodeBlockKit } from "./plugins/code-block-kit";
import { TableKit } from "./plugins/table-kit";
import { MarkdownKit } from "./plugins/markdown-kit";
import { MathKit } from "./plugins/math-kit";
import { TocKit } from "@/components/editor/plugins/toc-kit";

const DEFAULT_VALUE = [{ type: "p", children: [{ text: "" }] }];

export function RichEditor({
  initialValue = DEFAULT_VALUE,
  onDebounceChange,
  debounceDuration = 250,
}: {
  initialValue?: Value;
  onDebounceChange?: (value: Value) => void;
  debounceDuration?: number;
}) {
  const editor = usePlateEditor({
    plugins: [
      ...BasicNodesKit,
      ...BaseCalloutKit,
      ...CalloutKit,
      ...IndentKit,
      ...BaseToggleKit,
      ...ToggleKit,
      ...SlashKit,
      ...EmojiKit,
      ...FloatingToolbarKit,
      ...DndKit,
      ...ListKit,
      ...AutoformatKit,
      ...CodeBlockKit,
      ...TableKit,
      ...MarkdownKit,
      ...MathKit,
      ...TocKit,
    ],
    value: initialValue,
  });

  const [value, setValue] = useState<Value>(initialValue);

  const handleChange = ({ value }: { value: Value }) => {
    setValue(value);
  };

  const debouncedValue = useDebounce(value, debounceDuration);
  useEffect(() => {
    if (onDebounceChange) {
      onDebounceChange(debouncedValue);
    }
  }, [debouncedValue]);

  return (
    <Plate editor={editor} onChange={handleChange}>
      <EditorContainer>
        <Editor placeholder="Type or press '/' for commands..." />
      </EditorContainer>
    </Plate>
  );
}
