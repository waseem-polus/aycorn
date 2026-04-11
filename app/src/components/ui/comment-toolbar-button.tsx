import { MessageSquareTextIcon } from "lucide-react";
import { useEditorRef } from "platejs/react";

import { commentPlugin } from "@/features/editor/plugins/comment-kit";

import { ToolbarButton } from "@/components/ui/toolbar";

export function CommentToolbarButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.getTransforms(commentPlugin).comment.setDraft();
      }}
      data-plate-prevent-overlay
      tooltip="Comment"
    >
      <MessageSquareTextIcon />
    </ToolbarButton>
  );
}
