<h1 align="center">Entry Timestamp</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
</p>

> Obsidian plugin that auto-timestamps task entries and provides a URI handler for adding entries from external tools.

---

## Overview

This is a personal tool for a task-entry workflow where each entry is a Markdown task line with inline Dataview fields. The plugin handles two things: stamping entries with creation time, and accepting entries from external tools via URI.

## Features

### Timestamp on Enter

When you press Enter after a task line, Obsidian creates a new `- [ ] ` line. This plugin intercepts that and:

1. Appends `[created:: 2026-03-09T22:15:00-07:00]` to the previous line (the entry you just finished)
2. Copies the status character from the previous line to the new line

Before:
```
- [E] Some entry I just typed
- [ ]
```

After:
```
- [E] Some entry I just typed [created:: 2026-03-09T22:15:00-07:00]
- [E]
```

Timestamps use ISO 8601 with local timezone offset, compatible with Dataview's DateTime type.

### URI Protocol Handler

Add entries from external tools (shell scripts, Shortcuts, CLI) via:

```
obsidian://entry-timestamp?text=Some+entry+text&file=optional-note&status=E
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `text` | Yes | — | Entry body text (auto-capitalized) |
| `file` | No | Today's daily note | Target note filename (without .md) |
| `status` | No | `!` | Single status character |

The entry is appended to the target file as:
```
- [!] Some entry text [created:: 2026-03-09T22:15:00-07:00]
```

## Installation

This plugin is not published to the Obsidian community directory. It can be installed via [BRAT](https://github.com/TfTHacker/obsidian42-brat) at your own discretion:

1. Install the BRAT plugin if you haven't already
2. In BRAT settings, add `darrenkuro/obsidian-entry-timestamp`
3. Enable the plugin in Obsidian's community plugins settings

As a personal tool, there are no guarantees of support or compatibility with future Obsidian versions.

## Project Structure

```
obsidian-entry-timestamp/
  src/
    main.ts           -- Plugin source (~110 lines)
  manifest.json       -- Obsidian plugin manifest
  esbuild.config.mjs  -- Build config
  .github/
    workflows/
      release.yml     -- CD: build + release on push to main
```

---

## License

[MIT](LICENSE) - Darren Kuro
