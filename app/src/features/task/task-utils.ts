import type { Descendant } from "platejs";

export const extractPlainText = (nodes: Descendant[]): string =>
  nodes
    .map((node) => {
      if ("text" in node) return node.text;
      const el = node as {
        type: string;
        texExpression?: string;
        children: Descendant[];
      };
      if (el.type === "equation") return `\n${el.texExpression ?? ""}`;
      if (el.type === "inline_equation") return `${el.texExpression ?? ""}`;
      return extractPlainText(el.children);
    })
    .join("");
