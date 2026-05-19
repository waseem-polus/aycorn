# Aycorn — Agent Instructions

This file tells AI agents how to write code for this project. Read it before writing any code.

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

## Project Structure

```
src/
  components/     # legacy shared components (migrating away from this)
  features/       # preferred — organize files by the feature that uses them
  hooks/          # global hooks used across multiple features
  utils/          # global utils used across multiple features
  queries/        # global TanStack Query hooks (grouped by feature)
server/
  handlers/       # HTTP layer — routes requests to services
  services/       # business logic
  repositories/   # data access layer (SQLite queries)
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
- **Always wait for server confirmation** before updating UI — no optimistic updates.
- **TanStack queries and mutations must live in a dedicated hook file** under `queries/` (or the feature's `queries/` folder). Never write `useQuery` / `useMutation` inline in a component. Components consume the hook; the hook owns the URL, the cache key, and the invalidations. This keeps fetch logic out of the render tree and makes it reusable across components.

---

## Styling & Components

- Use **Tailwind CSS** for all styling. No CSS modules, no styled-components.
- If **shadcn/ui** has a component for something, use it — don't write a custom component from scratch.
- **Adding shadcn components** — always use the shadcn CLI (`npx shadcn@latest add <component>`) to install. It writes the component file into `src/components/ui/` and installs the right peer deps. Don't `npm install` the radix package by hand or hand-author the wrapper file.
- Loading states and empty states are handled per-component. If a shared pattern becomes obvious (e.g., a skeleton wrapper used in 3+ places), flag it as a refactor opportunity but don't abstract prematurely.

---

## Error Handling

- **Frontend:** Show a toast notification on any failed action. Don't silently swallow errors.
- **Backend (Go):** Check errors immediately and bubble them up the call stack. No silent failures.
- **Backend logging:** Log meaningful errors in the service/handler layer.

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

## Backend Architecture (Go)

Strict three-layer separation:

```
Handler → Service → Repository
```

- **Handlers** handle HTTP — parse requests, call services, write responses.
- **Services** contain all business logic. No SQL here.
- **Repositories** contain all SQL queries. No business logic here.

---

## Database (SQLite)

Schema summary:

```sql
project (id, name, pinned, timeCreated)
checklist (id, project, name, timeCreated, isDefault)  -- one default per project, trigger-enforced
task (id, checklist, name, body, timeCreated, timePlannedStart, timePlannedEnd,
      timeCompleted, assignee, priority, type, status)
```

Key notes:
- Tasks belong to a **checklist**, not directly to a project. Hierarchy: `project → checklist → task`.
- `status` and `type` are hardcoded `CHECK` constraints right now. Custom workflows and custom tags will require a **schema migration** — flag this whenever touching those fields.
- `body` is a JSON array (Plate.js document format).
- `timePlannedEnd` must be >= `timePlannedStart` — trigger-enforced.

---

## UX Constraints

- **Keyboard-first.** Every feature should be operable without a mouse. Think about keyboard shortcuts, focus management, and command-palette patterns from the start — not as an afterthought.
- **No over-engineering.** This is a personal tool. Avoid enterprise patterns.

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
- **Flag migration schema implications** whenever a feature touches `status` or `type` fields on tasks.
- **Flag keyboard interaction gaps** if a feature is being implemented without keyboard support.
- **Flag hardcoded colors** whenever you see a fixed Tailwind color (e.g. `neutral-700`, `emerald-500`, `gray-100`) used for text, background, or border. These break dark mode. Replace them with semantic tokens from `index.css` — e.g. `text-foreground`, `bg-background`, `bg-primary`, `text-muted-foreground`, `border-border`. Check the full token list in `app/src/index.css`.
