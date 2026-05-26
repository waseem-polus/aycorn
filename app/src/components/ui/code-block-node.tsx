import * as React from "react";

import type { PlateElementProps, PlateLeafProps } from "platejs/react";

import { CheckIcon, CopyIcon } from "lucide-react";
import { NodeApi } from "platejs";
import { PlateElement, PlateLeaf, useEditorRef } from "platejs/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { label: "Plain text", value: "plaintext" },
  { label: "Bash", value: "bash" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "CSS", value: "css" },
  { label: "Go", value: "go" },
  { label: "HTML", value: "xml" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "Kotlin", value: "kotlin" },
  { label: "Markdown", value: "markdown" },
  { label: "Python", value: "python" },
  { label: "Rust", value: "rust" },
  { label: "SQL", value: "sql" },
  { label: "Swift", value: "swift" },
  { label: "TypeScript", value: "typescript" },
  { label: "YAML", value: "yaml" },
];

export function CodeBlockElement(props: PlateElementProps) {
  const { children, element } = props;
  const editor = useEditorRef();
  const lang = (element.lang as string) ?? "plaintext";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = (element.children as any[])
      .map((line) => NodeApi.string(line))
      .join("\n");
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PlateElement
      {...props}
      as="div"
      className={cn(
        "my-4 rounded-md bg-muted font-mono text-sm",
        props.className,
      )}
    >
      <div
        className="flex items-center justify-end gap-1 px-3 h-8"
        contentEditable={false}
      >
        <Select
          value={lang}
          onValueChange={(value) => {
            editor.tf.setNodes({ lang: value }, { at: element as any });
          }}
        >
          <SelectTrigger
            size="sm"
            className="bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent hover:text-foreground hover:cursor-pointer border-none px-2 py-0 text-xs text-muted-foreground shadow-none focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value} className="text-xs">
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 text-muted-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="size-3" />
          ) : (
            <CopyIcon className="size-3" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto px-4 pt-2 pb-8">{children}</pre>
    </PlateElement>
  );
}

export function CodeLineElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} as="div">
      {props.children}
    </PlateElement>
  );
}

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const { className } = props.leaf as { className?: string };
  return (
    <PlateLeaf {...props}>
      <span className={className}>{props.children}</span>
    </PlateLeaf>
  );
}
