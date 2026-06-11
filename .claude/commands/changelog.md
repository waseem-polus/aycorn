Generate a GitHub release changelog for this project by reading git history and drafting it in the established Aycorn style.

## Arguments

`$ARGUMENTS` contains everything the user typed after `/changelog`, e.g. `v0.1.4` or `v0.1.4 my-branch`.

Parse as follows:
- First token = version (required, e.g. `v0.1.4`). If missing, ask for it before continuing.
- Second token = branch name (optional). If omitted, use the current branch (`git rev-parse --abbrev-ref HEAD`).

## Phase 1 — Gather commits

Run these git commands:

```bash
# Find the most recent tag (comparison base)
git describe --tags --abbrev=0

# Get all commits from that tag to the tip of the target branch
git log <tag>..<branch> --oneline --no-merges

# Get a file-level summary of what changed
git diff --stat <tag>..<branch>
```

Use the output to understand the scope of the release: what features landed, what files changed, whether there are any schema migrations (look for new files under `server/migrations/`), and what qualifies as "under the hood."

## Phase 2 — Draft (plain prose, no codeblock)

Write a preliminary changelog following the **Style Rules** below. Output it as plain prose/markdown in your response — **not** inside a fenced codeblock — so the user can read and comment on it easily.

End with: "Let me know any changes, additions, or corrections — when you're satisfied I'll output the final markdown codeblock."

## Phase 3 — Final output

After the user approves or requests edits, incorporate any changes and output the finished changelog inside a single fenced codeblock:

````
```md
<changelog content here>
```
````

---

## Style Rules

Follow these rules precisely — they are extracted from v0.1.0–v0.1.2 releases:

1. **Opening paragraph** — 1–2 sentences of prose that name the release theme and note any schema/migration changes and whether existing data carries over. No bullets. Example: *"This update brings X and Y. The schema gains Z; existing data carries over unchanged."*

2. **`**Highlights**` section** — bold header, then a bullet list. Each bullet uses this format:
   ```
   - **Feature name** — description sentence(s).
   ```
   Group bullets by theme (not alphabetically). 1–3 sentences per bullet. Lead with what the user can do, not implementation detail.

3. **`**Under the hood**` catch-all bullet** — one bullet at the end of Highlights for minor internal changes (dependency bumps, build config, icon swaps, refactors with no user-facing impact). List them as a short inline series, not sub-bullets.

4. **Schema changes** — if any migration files were added, include a bold paragraph after Highlights:
   ```
   **Schema change** — migration `NNNNN` adds/removes <columns> to the <table> table. The migration runs automatically on first launch; existing rows default to <value>.
   ```
   Omit this section entirely if there are no schema changes.

5. **Known limitations** — always include this one-liner:
   ```
   Known limitations — alpha quality, localhost-only, no auth.
   ```

6. **Full Changelog link** — include this as the final line only if you can resolve both the previous tag and the new version tag from git:
   ```
   **Full Changelog**: https://github.com/waseem-polus/aycorn/compare/<prev-tag>...<new-version-tag>
   ```
   If the new version tag doesn't exist yet (pre-release preview), construct the URL using the branch tip or omit the line.

7. **Tone** — technically precise, present tense for features ("the app now supports…"), no marketing language, no filler adjectives like "powerful" or "seamless."
