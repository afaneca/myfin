# Development Guide

## Runtime environment

This repository is developed inside WSL, not the Windows PowerShell runtime. Automation launched
from Windows may start in PowerShell or from a UNC path; run Node.js, npm, Vite, TypeScript, Biome,
and Git commands through WSL in that situation:

```powershell
wsl -d Ubuntu-26.04 -- bash -lc "cd ~/projects/myfin-web && <command>"
```

Do not spend time checking whether PowerShell has `npm` available. It does not for this project
context; use WSL immediately.

If `rg` in WSL resolves to a Windows-injected binary and fails with a permission error, use a
native `/usr/bin/rg` when available or fall back to `find` and `grep`.

## Project commands

Run commands from the repository root. The project uses npm and commits `package-lock.json`.

- Install dependencies only when needed: `npm install`
- Start the development server: `npm run dev -- --host 0.0.0.0`
- Run lint checks: `npm run lint`
- Run the production build and TypeScript checks: `npm run build`
- Preview the production build: `npm run preview -- --host 0.0.0.0`

## Verification

After meaningful code changes, run `npm run lint` and `npm run build`. Prefer the smallest
additional checks that exercise the changed behavior.

For UI-facing changes, start Vite from WSL and inspect the affected route in a browser when
practical. Report any verification step that could not be completed and explain why.
