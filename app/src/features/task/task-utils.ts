import type { Descendant } from "platejs";

const BLOCK_TYPES = new Set([
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "code_block",
  "code_line",
  "li",
  "toggle",
  "callout",
]);

export const extractPlainText = (nodes: Descendant[]): string =>
  nodes
    .map((node) => {
      if ("text" in node) return node.text;
      const el = node as {
        type: string;
        texExpression?: string;
        children: Descendant[];
      };
      if (el.type === "equation") return `${el.texExpression ?? ""}\n`;
      if (el.type === "inline_equation") return `${el.texExpression ?? ""}`;
      if (el.type === "table_row") {
        const cellTexts = (
          el.children as Array<{ children: Descendant[] }>
        ).map((cell) => extractPlainText(cell.children).trimEnd());
        return cellTexts.join("\t") + "\n";
      }
      if (BLOCK_TYPES.has(el.type)) return extractPlainText(el.children) + "\n";
      return extractPlainText(el.children);
    })
    .join("");
