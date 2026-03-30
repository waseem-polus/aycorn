import { Plate, usePlateEditor } from "platejs/react";

import { BasicNodesKit } from "@/features/editor/plugins/basic-nodes-kit";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { BaseCalloutKit } from "@/features/editor/plugins/callout-base-kit";
import { CalloutKit } from "@/features/editor/plugins/callout-kit";
import { IndentKit } from "@/features/editor/plugins/indent-kit";
import { BaseToggleKit } from "@/features/editor/plugins/toggle-base-kit";
import { ToggleKit } from "@/features/editor/plugins/toggle-kit";
import { ToolbarSeparator } from "@radix-ui/react-toolbar";
import { SlashKit } from "@/features/editor/plugins/slash-kit";
import { EmojiKit } from "@/features/editor/plugins/emoji-kit";
import { FloatingToolbarKit } from "./plugins/floating-toolbar-kit";
import { DndKit } from "./plugins/dnd-kit";
import { ListKit } from "./plugins/list-kit";
import { AutoformatKit } from "./plugins/autoformat-kit";

export function PlateEditor() {
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
    ],
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type or press '/' for commands..." />
      </EditorContainer>
    </Plate>
  );
}
