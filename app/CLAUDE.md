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
- **Always wait for server confirmation** before updating UI — no optimistic updates. **One carve-out:** drag-reorder / drag-move (dnd-kit). Reordering must feel instant, so update local order on drop, fire the mutation, and **revert to server state on error**. This applies to single and bulk drag (see `stage-list.tsx`). Nothing else gets optimistic treatment.
- **TanStack queries and mutations must live in a dedicated hook file** under `queries/` (or the feature's `queries/` folder). Never write `useQuery` / `useMutation` inline in a component. Components consume the hook; the hook owns the URL, the cache key, and the invalidations. This keeps fetch logic out of the render tree and makes it reusable across components.

---

## Styling & Components

- Use **Tailwind CSS** for all styling. No CSS modules, no styled-components.
- If **shadcn/ui** has a component for something, use it — don't write a custom component from scratch.
- **Adding shadcn components** — always use the shadcn CLI (`npx shadcn@latest add <component>`) to install. It writes the component file into `src/components/ui/` and installs the right peer deps. Don't `npm install` the radix package by hand or hand-author the wrapper file.
- Loading states and empty states are handled per-component. If a shared pattern becomes obvious (e.g., a skeleton wrapper used in 3+ places), flag it as a refactor opportunity but don't abstract prematurely.
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
