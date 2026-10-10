import { AIChatPlugin } from "@platejs/ai/react";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { getPluginTypes, isHotkey, KEYS } from "platejs";

import { BlockSelection } from "@/components/ui/block-selection";

export const hasSelectableClass = ({
  attributes,
  className,
}: {
  attributes: { className?: string };
  className?: string;
}) =>
  [className, attributes.className]
    .filter(Boolean)
    .join(" ")
    .includes("slate-selectable");

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    options: {
      areaOptions: {
        boundaries: `#${editor.meta.uid}`,
        container: `#${editor.meta.uid}`,
        features: { singleTap: { allow: false } },
        behaviour: {
          scrolling: { speedDivider: 0.8 },
          startThreshold: 4,
        },
      },
      enableContextMenu: true,
      isSelectable: (element) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]).includes(
          element.type,
        ),
      onKeyDownSelecting: (editor, e) => {
        if (isHotkey("mod+j")(e)) {
          editor.getApi(AIChatPlugin).aiChat.show();
        }
      },
    },
    render: {
      belowRootNodes: (props) => <BlockSelection {...(props as any)} />,
    },
  })),
];
