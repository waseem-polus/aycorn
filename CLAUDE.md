# Aycorn — Agent Instructions

This file tells AI agents how to work in this project. It is always loaded. It covers cross-cutting product and architectural rules.

**Layer-specific detail loads on demand:**
- Working in `server/` → also read [`server/CLAUDE.md`](server/CLAUDE.md) (Go architecture, full DB schema, running/reseeding, backend gotchas).
- Working in `app/` → also read [`app/CLAUDE.md`](app/CLAUDE.md) (React/TS rules, state, styling, frontend gotchas).
- A cross-layer task (e.g. a bulk feature with a Go handler and a React toolbar) → read both.

---

## What is Aycorn

A personal, self-hosted task management app (localhost only) that blends Jira-style project tracking with Notion-style flexibility. North star: **flexibility without complexity** — sensible defaults, power-user opt-ins.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Client data fetching | TanStack Query |
| Rich text | Plate.js |
| Drag and drop | dnd-kit |
| Backend | Go |
| Database | SQLite (`server/app.db`) |

---

## Repo Layout

```
app/      # React/TypeScript frontend       → app/CLAUDE.md
server/   # Go backend + SQLite             → server/CLAUDE.md
CLAUDE.md # this file (cross-cutting rules, always loaded)
```

The backend and frontend each carry their own `CLAUDE.md` that Claude Code auto-loads when the agent works in that tree. Keep cross-cutting rules here; push layer-specific detail down.

---

## Bulk Actions

This contract spans both layers, so it lives here.

When a list of entities supports multi-select operations:

- **Real bulk endpoints, never fan-out.** Add a dedicated server bulk handler (`POST /api/<entity>/bulk/<action>`, or `PUT` for in-place mutations). Do **not** loop the single-item endpoint with `Promise.all` on the client — that's N round-trips and N transactions. The handler performs the set operation in one request (one SQL statement, or one transaction for ordering/cascades).
- **Standard response shape.** Every bulk handler returns this struct (handlers needing more, e.g. duplicated IDs, embed it and add fields):
  ```go
  type BulkResult struct {
      Success int `json:"success"` // items the action was actually applied to
      Failed  int `json:"failed"`  // unexpected per-item error — a retry is reasonable
      Skipped int `json:"skipped"` // intentionally not acted on by design — retrying won't help
  }
  ```
  - `success` drives the primary toast ("Deleted 3 workflows.").
  - `skipped` is deliberate (e.g. an `open` stage can't change type, an in-use workflow can't be deleted). Surface it, don't treat it as an error ("2 in use.").
  - `failed` errored unexpectedly — tell the user to retry ("1 failed — try again.").
  - Atomic operations (e.g. reorder) still conform: `{success: N}` on commit; on transactional failure return an HTTP error, not `failed > 0`.
- **Skip server-side, not client-side.** If some selected items can't be acted on, send all IDs and let the SQL/service exclude them (e.g. `WHERE id IN (...) AND type <> 'open'`) and report them in `skipped`. The client trusts the result counts for its toast — it doesn't pre-filter.
- **Toolbar.** Every multi-select surface gets a floating toolbar built on `@/components/bulk-actions-toolbar-base.tsx`. The base owns the container styling, entrance/exit animation, the "{n} selected" label, the clear-selection button, and the Delete button + confirm dialog. Feature toolbars pass callbacks and contribute only their action-specific buttons as children. Don't hand-roll the floating container.
- **Selection plumbing.** Drag-select is provided once by `PageContent` (`SelectionContext` + `SelectionArea` from `@/hooks/useSelection`). Selectable items consume `useSharedSelection().getItemProps(id)`, set `data-task-card=""` (and `data-drag-handle=""` on a dnd-kit handle), and apply `selectedItemClasses({ ring })` for the standard selected look — kanban-item is the reference; pass `ring: false` for table rows. dnd-kit multi-drag goes through `wrapDragStart` / `wrapDragEnd(consumer, bulkHandler)`.
- **`data-task-card=""` on every dnd-kit draggable.** The `SelectionArea`'s `handleBeforeStart` returns `false` (suppressing the selection rectangle) whenever the pointer lands on `[data-task-card]` or `[data-drag-handle]`. This means **any** element that can be dnd-kit-dragged — even elements that aren't part of bulk selection — must carry `data-task-card=""`. Without it the selection rectangle appears while the user drags, which looks broken.

---

## UX Constraints

- **Keyboard-first.** Every feature should be operable without a mouse. Think about keyboard shortcuts, focus management, and command-palette patterns from the start — not as an afterthought.
- **No over-engineering.** This is a personal tool. Avoid enterprise patterns.

---

## Data Editing & Creation

Core philosophy: let users change as much of the visible data as possible *where they see it*, without navigating to a dedicated page or opening a generic form.

- **Edit in place, everywhere it's visible.** Any field the user can see, they should be able to edit there. A rendered title becomes an editable title; a status badge becomes a dropdown. References: inline-editable project name in the projects table, and the bulk-action toolbars (editing shared properties of a multi-selection). Avoid generic "edit" forms in modals.
- **Incremental auto-save, no Save button.** Edits persist on `blur` / on change, and periodically for large rich-text bodies (the task editor saves the body on an interval, properties on blur/change). Don't add explicit Save/Submit buttons for edits.
- **Destructive actions confirm first.** Delete and other irreversible actions always go through a confirm modal — this is the one deliberate exception to "no buttons." References: the `BulkActionsToolbarBase` delete flow and `DeleteStageDialog`.
- **Create = empty entity, not a form.** To create an entity, immediately create a sensibly-defaulted empty instance and let the user fill it in place (or open its dedicated view if it has one) — e.g. "New Workflow" creates the workflow and navigates to it. Don't gate creation behind a dialog form. This is the natural extension of edit-in-place + auto-save.

---

## Priorities (in order)

1. **Flexibility** — design for change; prefer solutions that don't lock things in
2. **Readability** — code is read more than written; keep it clear
3. **Performance** — optimize only when there's a real reason

---

## Proactive Guidance

When writing code for this project:

- **Flag patterns** when a good design pattern applies — don't just write code, name the pattern.
- **Flag anti-patterns** when you see them in existing code and suggest a better approach.
- **Flag shared abstractions** when a loading state, hook, or utility is being duplicated and a shared version would be worth extracting.
- **Flag migration schema implications** whenever a feature changes the allowed values of a hardcoded `CHECK` constraint — `task.priority`, `task.type`, or `stage.type` (see `server/CLAUDE.md`).
- **Flag keyboard interaction gaps** if a feature is being implemented without keyboard support.
- **Flag hardcoded colors** whenever you see a fixed Tailwind color (e.g. `neutral-700`, `emerald-500`, `gray-100`) used for text, background, or border. These break dark mode. Replace them with semantic tokens from `index.css` — e.g. `text-foreground`, `bg-background`, `bg-primary`, `text-muted-foreground`, `border-border`. Check the full token list in `app/src/index.css`.
- **Flag fan-out bulk calls** when a multi-item action is implemented as `Promise.all` over a single-item endpoint instead of a real bulk handler returning `BulkResult`.
- **Flag missing confirm** on any destructive action that executes without a confirm modal.
- **Flag modal create/edit forms** where in-place editing or a create-empty-then-edit flow would fit the project's UX philosophy.
