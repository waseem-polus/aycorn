# Aycorn Frontend — Agent Instructions

Loaded when working in `app/`. Read alongside the root [`CLAUDE.md`](../CLAUDE.md) (cross-cutting rules, the Bulk Actions contract, the edit-in-place / create-empty UX philosophy).

---

## Project Structure

```
src/
  components/     # legacy shared components (migrating away from this)
  features/       # preferred — organize files by the feature that uses them
  hooks/          # global hooks used across multiple features
  utils/          # global utils used across multiple features
  queries/        # global TanStack Query hooks (grouped by feature)
```

**Migration direction:** New code goes in `src/features/<feature-name>/`. As existing hooks, utils, and queries become clearly feature-specific, migrate them there. Keep things in the global directories only if they're genuinely shared across features.

---

## React & TypeScript Rules

- **Functional components only.** No class components.
- **No barrel files** (`index.ts` re-exports). Import directly from the source file.
- **Always use `@/` path aliases** — never relative paths in `.ts`/`.tsx` files.
  - ✅ `import { useProjects } from "@/hooks/useProjects"`
  - ❌ `import { useProjects } from "../../hooks/useProjects"`
- Prefer `type` over `interface` for all type definitions.
- **Never use `any`.** If a type is unknown, use `unknown` and narrow it.
- No Zod or runtime validation — keep it simple.

---

## State Management

- **Client state** lives in React Contexts. Don't introduce Zustand, Redux, or other state libraries.
- **Server state** is fetched via TanStack Query. Queries are grouped into hooks by feature (e.g., `useTaskQueries`, `useProjectQueries`).
- **Always wait for server confirmation** before updating UI — no optimistic updates. **Two carve-outs:**
  1. drag-reorder / drag-move (dnd-kit): Reordering must feel instant, so update local order on drop, fire the mutation, and **revert to server state on error**. This applies to single and bulk drag (see `stage-list.tsx`).
  2. Toggle switches for boolean/membership state (e.g., enabling/disabling a task type per project): The animation is what makes toggles feel responsive, so update local state immediately and revert on error.
- **TanStack queries and mutations must live in a dedicated hook file** under `queries/` (or the feature's `queries/` folder). Never write `useQuery` / `useMutation` inline in a component. Components consume the hook; the hook owns the URL, the cache key, and the invalidations. This keeps fetch logic out of the render tree and makes it reusable across components.

---

## Styling & Components

- Use **Tailwind CSS** for all styling. No CSS modules, no styled-components.
- If **shadcn/ui** has a component for something, use it — don't write a custom component from scratch.
- **Adding shadcn components** — always use the shadcn CLI (`npx shadcn@latest add <component>`) to install. It writes the component file into `src/components/ui/` and installs the right peer deps. Don't `npm install` the radix package by hand or hand-author the wrapper file.
- Loading states and empty states are handled per-component. If a shared pattern becomes obvious (e.g., a skeleton wrapper used in 3+ places), flag it as a refactor opportunity but don't abstract prematurely.
- **Truncated text always gets a tooltip.** Whenever text is truncated (via `truncate` or `line-clamp-*`), wrap it in a `<Tooltip>` that shows the full text. Only render the `<TooltipContent>` when there's actually content to show.
- **Frontend error handling:** show a toast notification on any failed action. Don't silently swallow errors.

---

## Frontend Gotcha: portal'd dialogs/menus bubble through the React tree

Radix primitives (`AlertDialog`, `DropdownMenu`, etc., via shadcn) render their content through a **portal** — it's elsewhere in the DOM, but React **synthetic events still bubble through the React component tree**, not the DOM tree.

Consequence: a dialog/menu rendered as a child of a click-to-navigate `Card` (or any element with an `onClick`) will fire that parent handler when the user clicks *inside the dialog*. This bit the workflow cards (clicking "Delete" in the confirm dialog navigated to the workflow page).

Fix: render the dialog/menu as a **sibling** of the clickable container, not a descendant of it (lift it out and use a fragment). This pattern recurs here because cards navigate on click and commonly contain a menu + confirm dialog.

---

## Code Style

- **File length:** Aim for short-to-moderate. If a file is getting long, split it by purpose (not just by line count).
- **One component per file.** Each component lives in its own file. If a component has dependent / child components, put them in a directory named after the parent (without the extension) alongside the parent file. Example: `projects-data-table.tsx` lives next to a `table/` directory that contains its child components like `sortable-header.tsx` and `project-row-actions.tsx`.
- **Function declaration style.** Components are declared with `function Name() {}`. Every other function — event handlers, helpers, and anything else defined inside a component or module — uses `const name = () => {}`. This makes components visually distinct from the handlers and helpers around them.
- **Naming:** Clear and descriptive. One word is great if it's unambiguous; use more words if needed for clarity. Never sacrifice clarity for brevity.
- **Abstraction:** Accept some repetition to keep readability. Abstract into hooks wherever it makes sense — hooks are the primary abstraction mechanism on the frontend.
- **Dependencies:**
  - Small things → write it yourself.
  - Bigger things (calendar, rich text, etc.) → prefer a shadcn-style owned copy in the codebase over a runtime library dependency.
  - Last resort → a library (used for things like DnD that are complex and edge-case-heavy).

---

## Drag & DnD Patterns

### Desktop whole-card / mobile handle-only

For card-like surfaces that are dnd-kit-draggable, use this split:
- **Desktop:** the whole card is the drag target. Apply dnd-kit's pointer listeners (everything except `onTouchStart`) to the card's outer element.
- **Mobile:** only a grip handle is draggable. Pull `onTouchStart` out of the listeners and put it on a `<button data-drag-handle="" style={{ touchAction: "none" }}>` that is `hidden pointer-coarse:flex`. The rest of the card is not a drag surface on touch.

```tsx
const { onTouchStart, ...pointerListeners } = (listeners ?? {}) as {
  onTouchStart?: React.TouchEventHandler;
} & Record<string, (e: React.SyntheticEvent) => void>;
```

`kanban-item.tsx` and `task-type-card.tsx` are the references.

### Click-to-edit coexisting with drag

Do **not** use `onPointerDown` stop-propagation on editable areas inside a draggable card to prevent accidental drags. Instead, rely on dnd-kit's `activationConstraint: { distance: 4 }` on the `PointerSensor`. A short click (pointer-down + pointer-up without moving 4 px) focuses the editable naturally. A drag only activates after 4 px of movement. Stop-propagation on `onPointerDown` would break drag-from-title, which should work.

Do keep `onKeyDown` stop-propagation on editable containers so app-level keyboard shortcuts don't fire while the user is typing.

Add `cursor-text` to the `EditableHeader` className when it lives inside a `cursor-grab` container — otherwise the grab cursor cascades in and the text cursor never appears on hover.

### When to always-render `EditableHeader` vs. render conditionally

- **Leaf cards** (clicking the card does nothing, or only opens an inline edit): always render `EditableHeader` directly. The component handles its own placeholder via CSS and has its own hover styling. No need to swap between a static `<span>` and an editable — the conditional swap loses the placeholder and hover affordance.
- **Navigation cards** (clicking the card navigates somewhere, like `workflow-card.tsx`): render `EditableHeader` conditionally, only when `isEditing` is true. When the card navigates on click, the primary click action is navigation — always-on contenteditable would intercept clicks and prevent navigation.

---

## Feature Notes

### Task Types (`features/task-types/`)

Task types belong to categories (`TaskTypeCategory`). The global task types page (`/task-types`) renders a collapsible, reorderable category section per category, each containing a card grid. Task type ordering within categories is deferred.
