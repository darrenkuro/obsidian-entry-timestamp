# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # watch mode — rebuilds on file changes
pnpm build            # production build (minified, no sourcemaps)
```

No test suite — testing is manual in an Obsidian vault.

## Release Process

CI runs on every push to `main` (`.github/workflows/release.yml`). It builds the plugin and creates/updates a GitHub release tagged with the version from `manifest.json`. The release contains `manifest.json` and `main.js`.

**Version must be bumped in both `manifest.json` and `package.json` before pushing.** These two files must stay in sync. The CI release tag is read from `manifest.json`.

## Architecture

Single-file Obsidian plugin (`src/main.ts`, ~135 lines). Extends `Plugin` from the Obsidian API.

### Two features:

1. **Auto-timestamp on Enter** (`onEditorChange`): When a user presses Enter after a task line (`- [x] ...`), the plugin appends `[created:: <ISO8601>]` to the previous line and copies the status character to the new line. Only fires when the new line is an exact empty task (`- [ ] `).

2. **URI handler** (`onProtocolAction`): `obsidian://entry-timestamp?text=...&status=...&file=...` appends a timestamped task to a file (defaults to today's daily note).

### Critical pattern: re-entrancy guard

Editor modifications are deferred via `queueMicrotask()` to avoid violating CodeMirror 6's "no dispatch during update" constraint. A `processing` boolean flag prevents the handler from responding to its own edits. Removing either of these causes editor freezes (see commit 4f994f0).

### Build

esbuild bundles `src/main.ts` → `main.js` (CJS). Obsidian and all `@codemirror/*` / `@lezer/*` packages are externalized — they're provided by Obsidian at runtime.
