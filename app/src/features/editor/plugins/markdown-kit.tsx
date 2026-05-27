import type { Plugin } from "unified";

import { MarkdownPlugin } from "@platejs/markdown";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkGfm, remarkEmoji as Plugin, remarkMath],
    },
  }),
];
