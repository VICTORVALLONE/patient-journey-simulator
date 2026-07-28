# CONVENTIONS.md — code conventions (FisioApp)

Canonical home for **code-style and authoring conventions**. Companion to `CLAUDE.md` (which owns _architecture_) and `DESIGN.md` (which owns _visual design tokens_). This file does not repeat those — it points. Rescued and corrected from the retired `obsoleto/CLAUDE.md` (2026-07-14): rules that were still true were kept; rules the stack outgrew were fixed (noted inline).

## Language & platform

- **Mobile-first, base viewport 375px.** Nothing breaks at 320px. The whole app renders inside `MobileFrame` (phone-sized) — design and test at phone width.
- **Web-first, native-aware.** Nothing on the critical path may depend solely on SSR (Capacitor packaging comes later). See `CLAUDE.md` for the SSR/hydration rules.
- **UI copy is Brazilian Portuguese.** Don't hardcode user-facing strings inline where a constant/module is the pattern; keep copy easy to find.

## TypeScript

- **Strict, no `any`.** All shared interfaces live in `src/lib/types.ts` (not `src/types/index.ts` — that path is from the old spec).
- **One component per file.**
- **Props interface named `[ComponentName]Props`.**
- **No prop-drilling beyond 2 levels** — reach for the Zustand store (`src/store/patient.ts`) or Context instead.

## Naming

- Components: `PascalCase`, `.tsx` files.
- Hooks: `camelCase` with `use` prefix, `.ts` files.
- Constants: `UPPER_SNAKE_CASE`.
- Server-only modules: `.server.ts` suffix (kept out of the client bundle — see `CLAUDE.md`).

## Libraries (locked — don't swap without a decision in `DECISIONS.md`)

- **Icons:** `lucide-react` only. No heroicons, no material icons.
- **Charts:** `recharts` only. No D3, no Chart.js. Read the `dataviz` skill before authoring the first chart of a feature.
- **UI primitives:** shadcn/ui ("new-york"), generated into `src/components/ui/` — generally don't hand-edit.
- **Styling:** Tailwind **v4** utility classes (updated — the old doc said "Tailwind v3, pure, no UI libs"; the app now uses Tailwind v4 **+ shadcn**). No styled-components, no CSS modules, no emotion.
- Colors come from the **OKLCH design tokens in `DESIGN.md`** — do not hardcode hex values (the old doc pinned `#2563EB`/`#0F1C47`; those are superseded by the token system).

## Data & state

- **localStorage IS used** for the current mock: the Zustand store persists to key `fisiocare-patient-v2` (schema `version: 4`, with a `migrate` fn; two sibling keys documented in `CLAUDE.md`). ⚠️ This _reverses_ the old rule "no localStorage for clinical data" — that rule assumed a Supabase backend that doesn't exist yet. When real patient data arrives (own Supabase, LGPD gate — see `DECISIONS.md`), revisit.
- Bump **both** the persist `version` and the `migrate` fn when changing the persisted shape.
- Derive, don't duplicate: current phase, today's session, ordered exercises all come from selector helpers at the bottom of `patient.ts`. Don't recompute them ad-hoc in components.

## Accessibility & performance

- **Exercise instructions must be legible without the video** — patients on limited mobile data rely on the text.
- **Lazy-load** heavy assets (videos, images, weighty screens).
- WCAG target level is **to be locked in spec 05** (`docs/specs/05-design-system-ui/`). Until then, don't assume a level.

## Before finishing an edit

- `bun run lint` and `bun run format` (Prettier: `printWidth: 100`, double quotes, semicolons, trailing commas).
- No standalone typecheck script — type errors surface via editor/build.
- Publishing flow and the mandatory `git fetch` + `--ff-only` step live in the workspace `../../CLAUDE.md`.
