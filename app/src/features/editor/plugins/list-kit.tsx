import { ListPlugin } from "@platejs/list/react";
import { KEYS } from "platejs";

import { IndentKit } from "@/features/editor/plugins/indent-kit";
import { BlockList } from "@/components/ui/block-list";

export const ListKit = [
  ...IndentKit,
  ListPlugin.configure({
    inject: {
      targetPlugins: [
        ...KEYS.heading,
        KEYS.p,
        KEYS.blockquote,
        KEYS.codeBlock,
        KEYS.toggle,
        KEYS.img,
      ],
    },
    render: {
      belowNodes: BlockList,
    },
  }).overrideEditor(({ editor, tf: { normalizeNode } }) => ({
    transforms: {
      // @platejs/list's own normalizer clears `listType`/`listStart` off a
      // node that lost its `indent` (e.g. exiting an empty todo item via
      // Enter), but leaves `checked` behind. That stale `checked` then makes
      // toggleListSet/toggleListUnset treat the node as an existing todo,
      // silently no-opping the next "[] " autoformat attempt on it.
      normalizeNode([node, path]) {
        if (
          Object.hasOwn(node, KEYS.listChecked) &&
          !node[KEYS.listType as keyof typeof node]
        ) {
          editor.tf.unsetNodes(KEYS.listChecked, { at: path });
          return;
        }

        normalizeNode([node, path]);
      },
    },
  })),
];
