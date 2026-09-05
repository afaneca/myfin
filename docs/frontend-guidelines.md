# Frontend Guidelines

## Application structure

MyFin Web is a React 19, TypeScript, and Vite frontend. It uses MUI, Emotion, Nivo charts, React
Query, React Router, Formik, Yup, and i18next.

- Keep domain screens and components in `src/features/<domain>`.
- Keep domain API and data-access code in `src/services/<domain>`.
- Keep shared UI in `src/components`.
- Keep shared providers in `src/providers`.
- Keep shared helpers in `src/utils`.

## Coding conventions

- Follow existing TypeScript and React patterns before introducing new abstractions.
- Keep TypeScript strict: avoid `any`, preserve null checks, and prefer typed service and API
  boundaries.
- Reuse the existing MUI theme, shared components, and React Query patterns.
- Follow Biome formatting expectations: two-space indentation, LF line endings, single quotes,
  semicolons, trailing commas, and approximately 80 columns.
- Do not edit `dist`, `node_modules`, or generated artifacts unless the task explicitly requires
  it.

## Localization

Public translations live in `public/locales/<locale>/translation.json`.

Whenever user-facing copy is added or changed, enumerate the locale directories currently present
under `public/locales` and update the corresponding key in every `translation.json` file. Do not
assume a fixed set of supported languages.
