import { Plate, usePlateEditor } from "platejs/react";
import type { PlateEditor } from "platejs/react";

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
import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import { type Value } from "platejs";
import { CodeBlockKit } from "./plugins/code-block-kit";
import { TableKit } from "./plugins/table-kit";
import { MarkdownKit } from "./plugins/markdown-kit";
import { MathKit } from "./plugins/math-kit";
import { TocKit } from "@/features/editor/plugins/toc-kit";
import { BlockSelectionKit } from "@/features/editor/plugins/block-selection-kit";
import { CursorOverlayKit } from "./plugins/cursor-overlay-kit";
import { cn } from "@/lib/utils";
import { TrailingBlockKit } from "./plugins/trailing-block-kit";
import { ExitBreakKit } from "./plugins/exit-break-kit";

const DEFAULT_VALUE = [{ type: "p", children: [{ text: "" }] }];

export function RichEditor({
  initialValue = DEFAULT_VALUE,
  onDebounceChange,
  onEditorReady,
  debounceDuration = 250,
  className = "",
}: {
  initialValue?: Value;
  onDebounceChange?: (value: Value) => void;
  onEditorReady?: (editor: PlateEditor) => void;
  debounceDuration?: number;
  className?: string;
}) {
  const isMobile = useIsMobile();

  const desktopOnlyPlugins = [
    ...BlockSelectionKit,
    ...CursorOverlayKit,
    ...DndKit,
    ...ExitBreakKit,
    ...FloatingToolbarKit,
  ];

  const editor = usePlateEditor({
    plugins: [
      ...BasicNodesKit,
      ...BaseCalloutKit,
      ...CalloutKit,
      ...BaseToggleKit,
      ...AutoformatKit,
      ...CodeBlockKit,
      ...EmojiKit,
      ...IndentKit,
      ...ListKit,
      ...MarkdownKit,
      ...MathKit,
      ...SlashKit,
      ...TableKit,
      ...TocKit,
      ...ToggleKit,
      ...TrailingBlockKit,
      ...(isMobile ? [] : desktopOnlyPlugins),
    ],
    value: initialValue,
  });

  const [value, setValue] = useState<Value>(initialValue);
  const hasEmitted = useRef(false);

  useEffect(() => {
    onEditorReady?.(editor);
  }, []);

  const handleChange = ({ value }: { value: Value }) => {
    setValue(value);
  };

  const debouncedValue = useDebounce(value, debounceDuration);
  useEffect(() => {
    // Skip the initial emission that fires on mount with `initialValue` — only
    // genuine user edits should trigger a persist, never the mere act of
    // mounting the editor (which would otherwise write back the loaded value,
    // or an empty value before the real body has loaded).
    if (!hasEmitted.current) {
      hasEmitted.current = true;
      return;
    }
    onDebounceChange?.(debouncedValue);
  }, [debouncedValue]);

  return (
    <Plate editor={editor} onChange={handleChange}>
      <EditorContainer className="h-auto">
        <Editor
          placeholder="Type or press '/' for commands..."
          className={cn("h-auto min-h-64 pb-16", className)}
        />
      </EditorContainer>
    </Plate>
  );
}
