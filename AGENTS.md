# Codex Instructions

## Scope

These instructions apply to the whole repository.

## Runtime Environment

- The project is normally developed inside WSL, not the Windows PowerShell
  runtime.
- Codex Desktop may start commands from Windows PowerShell using the UNC path
  for a WSL checkout. Do not run Node, npm, Vite, TypeScript, Biome, or project
  Git commands directly from that PowerShell environment.
- When the active shell is PowerShell, run project commands through WSL:

  ```powershell
  wsl -d Ubuntu-26.04 -- bash -lc "cd ~/projects/myfin-web && <command>"
  ```

- Do not rediscover or re-explain that PowerShell lacks `npm` on `PATH`; start
  with the WSL wrapper above.
- If `rg` inside WSL resolves to the Windows Codex bundled binary and fails with
  a permission error, use native WSL tools such as `find` and `grep`, or a native
  `/usr/bin/rg` if present. This is an environment quirk, not a repo issue.

## Project Commands

- Package manager: npm, with `package-lock.json` committed.
- Install dependencies only when needed: `npm install`.
- Start dev server: `npm run dev -- --host 0.0.0.0`.
- Lint: `npm run lint`.
- Production build/type check: `npm run build`.
- Preview production build: `npm run preview -- --host 0.0.0.0`.

Run all commands from the repository root through WSL when Codex is launched
from Windows.

## Application Shape

- React 19 + TypeScript + Vite frontend.
- UI uses MUI, Emotion, Nivo charts, React Query, React Router, Formik/Yup, and
  i18next.
- Domain UI belongs under `src/features/<domain>`.
- Domain API/data access belongs under `src/services/<domain>`.
- Shared UI belongs in `src/components`.
- Shared providers belong in `src/providers`.
- Shared utilities belong in `src/utils`.
- Public translations live in `public/locales/en/translation.json` and
  `public/locales/pt/translation.json`.

## Coding Conventions

- Follow existing TypeScript and React patterns before introducing new
  abstractions.
- Keep TypeScript strict: avoid `any`, preserve null checks, and prefer typed
  service/API boundaries.
- Use the existing MUI theme and shared components for UI work.
- Add or update both English and Portuguese translation entries for user-facing
  copy.
- Keep Biome formatting expectations: 2 spaces, LF line endings, single quotes,
  semicolons, trailing commas, and about 80 columns.
- Do not edit `dist`, `node_modules`, or generated artifacts unless the user
  explicitly asks.

## Verification

- For code changes, prefer `npm run lint` and `npm run build`.
- If the change is UI-facing, run the Vite dev server through WSL and verify the
  affected screen in the browser when practical.
- Mention any verification command that could not be run and why.
