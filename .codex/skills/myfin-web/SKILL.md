# MyFin Web

Use this skill when working in the `myfin-web` repository, especially when
running commands, changing React/TypeScript code, or verifying frontend work.

## Start Here

This repository is developed inside WSL, not the Windows PowerShell runtime.
Use this command shape whenever Codex is launched from PowerShell:

```powershell
wsl -d Ubuntu-26.04 -- bash -lc "cd ~/projects/myfin-web && <command>"
```

Do not spend time checking whether PowerShell has `npm` available. It does not
for this project context; use WSL immediately.

## Useful Commands

- `npm run dev -- --host 0.0.0.0`
- `npm run lint`
- `npm run build`
- `npm run preview -- --host 0.0.0.0`

If `rg` fails in WSL because it resolves to a Windows Codex app path, fall back
to `find` and `grep` or a native WSL `rg`.

## Project Notes

- The app is a React 19, TypeScript, and Vite frontend.
- Keep domain screens and components in `src/features/<domain>`.
- Keep API/service calls in `src/services/<domain>`.
- Keep shared components in `src/components`, providers in `src/providers`, and
  helpers in `src/utils`.
- Use existing MUI theme/components and React Query patterns.
- Keep user-facing strings localized in both
  `public/locales/en/translation.json` and
  `public/locales/pt/translation.json`.

## Verification Habit

After meaningful code edits, run `npm run lint` and `npm run build` from WSL.
For UI changes, start Vite from WSL and inspect the affected route in the
browser when practical.
