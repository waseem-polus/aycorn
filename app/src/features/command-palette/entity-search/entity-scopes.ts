/** The kinds of things entity search finds. */
export type EntityKind = "task" | "project" | "workflow";

/**
 * Typing a token then a space at the start of the search (e.g. "t ") narrows
 * the search to one kind, shown as a removable chip. Order is the order the
 * result groups appear in when their best matches tie.
 */
export const entityScopes: Record<
  EntityKind,
  { token: string; label: string; placeholder: string }
> = {
  task: { token: "t", label: "Tasks", placeholder: "Search tasks…" },
  project: { token: "p", label: "Projects", placeholder: "Search projects…" },
  workflow: {
    token: "w",
    label: "Workflows",
    placeholder: "Search workflows…",
  },
};

export const entityKinds = Object.keys(entityScopes) as EntityKind[];

/** The scope a query's leading token asks for ("t foo" → task, "foo"), if any. */
export const parseScopeToken = (
  query: string,
): { scope: EntityKind; rest: string } | null => {
  const match = /^(\S) (.*)$/s.exec(query);
  if (!match) return null;
  const token = match[1].toLowerCase();
  const scope = entityKinds.find((kind) => entityScopes[kind].token === token);
  return scope ? { scope, rest: match[2] } : null;
};
