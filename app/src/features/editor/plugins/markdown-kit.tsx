import { MarkdownPlugin } from "@platejs/markdown";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkGfm, remarkEmoji],
    },
  }),
];
