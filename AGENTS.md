# SASE-310 System

## Purpose
SASE-310 is a school management and incident tracking system for a Mexican
secondary school. The system supports student tracking, academic monitoring,
incident documentation, institutional reporting, and AI-assisted analysis for
teachers. It is intended for real classroom use and must remain stable and
secure.

## Tech Stack
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Vercel Serverless Functions (Node.js)
- AI Providers: OpenRouter, Google Gemini
- Database: Supabase
- Testing: Vitest, Testing Library, JSDOM

## Project Structure
- `src/` main app code
- `src/components/` UI and feature components
- `src/modules/` domain modules (expedientes, documentos)
- `src/utils/` shared helpers
- `src/hooks/` custom hooks
- `src/supabase/` client + generated types
- `api/` Vercel serverless endpoints
- `tests/` Vitest suites and setup

## Commands
Install dependencies:
`npm install`

Run dev server:
`npm run dev`

Build:
`npm run build`

Preview production build:
`npm run preview`

Tests (Vitest):
`npx vitest`

Run a single test file:
`npx vitest tests/Agenda.test.tsx`

Run a single test by name:
`npx vitest -t "Dashboard Docente"`

Watch mode (single file):
`npx vitest tests/Agenda.test.tsx --watch`

Typecheck (no script defined; optional):
`npx tsc -p tsconfig.json --noEmit`

Lint/format:
- No ESLint/Prettier configs found in this repo. Do not invent new rules.
- Follow existing formatting and patterns in the file you touch.

## Development Rules (must follow)
1. Never expose API keys in frontend code.
2. All AI calls must go through serverless endpoints in `api/ai`.
3. Maintain compatibility with the Vercel serverless environment.
4. Do not break existing endpoints or response shapes.
5. Prefer modular architecture when adding features.

## Coding Standards (observed conventions)
### Language and Types
- Use TypeScript for all app code.
- Prefer `interface` for object shapes, `type` for unions, `enum` for fixed sets.
- Keep domain field naming consistent with existing data (many fields are
  Spanish and some are snake_case). Do not rename without a migration.
- Use explicit types for public APIs, shared helpers, and complex state.

### Imports
- Use double quotes for strings and imports.
- Keep imports at the top of the file in this order:
  1) external packages, 2) internal absolute/relative imports, 3) styles.
- Aliases: `@/` maps to `src/` (see `tsconfig.json` and `vite.config.ts`).
- Prefer named exports for components and helpers unless the file already uses
  a default export (e.g. `src/App.tsx`).

### Formatting
- Semicolons are used everywhere.
- 2-space indentation.
- Arrow functions for callbacks and components.
- Trailing commas are common in multi-line literals.
- JSX uses Tailwind utility classes; keep className strings readable and
  grouped by intent.

### React Patterns
- Functional components with hooks.
- Lazy load heavy modules using `React.lazy` + `React.Suspense`.
- Use `React.FC` where the file already follows that style.
- Error boundaries are used at app entry and layout level.
- Avoid side effects outside `useEffect`.

### State and Data
- Central app state lives in `src/store.tsx` and is accessed via hooks.
- Keep state updates immutable.
- When adding new state, follow existing patterns in `useApp` and related hooks.

### Error Handling
- Serverless endpoints validate method, origin, body shape, and input sizes.
- Prefer early returns with clear HTTP status codes.
- Do not log secrets. Avoid logging full request bodies.
- Wrap external calls with `try/catch` and surface actionable error messages.

### API and AI Integration
- AI routing happens through `api/ai/openrouter.ts` and `api/ai/gemini.ts`.
- Client-side AI calls use `src/components/ai/aiRouter.ts`.
- Do not call AI providers directly from the browser.
- Respect `ALLOWED_ORIGINS` in serverless handlers.
- Rate limiting is local in-memory; do not rely on it for security guarantees.

### Supabase
- Client uses `import.meta.env.VITE_SUPABASE_URL` and
  `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- Do not expose service role keys in the frontend.
- Types are generated and imported from `src/supabase/types.ts`.

### Environment and Secrets
- Frontend env vars must use the `VITE_` prefix and `import.meta.env`.
- Serverless env vars are read from `process.env` only.
- Never commit `.env` files or secrets.

### UI and Styling
- Styling is Tailwind-first. Keep className groups readable and purposeful.
- Prefer existing UI patterns and component styles before introducing new ones.
- Preserve Spanish labels and UX copy to match the domain vocabulary.

## Testing Notes
- Tests live in `tests/` and use Testing Library + Vitest.
- Vitest config is `vitest.config.ts` with `jsdom` and setup file
  `tests/setup.ts`.
- Prefer test names that match user-visible behavior.

## Cursor/Copilot Rules
- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- No Copilot instructions found in `.github/copilot-instructions.md`.

## Agent Guidance
- Keep changes focused and avoid large refactors unless requested.
- Match the existing code style of the files you edit.
- Preserve Spanish domain terminology in UI labels and data fields.
- Ensure any new endpoints or UI modules include validation and access checks.
