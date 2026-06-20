# HeroUI v3 Migration

## Completed

- [x] Replace HeroUI v2 packages with `@heroui/react` and `@heroui/styles` v3.
- [x] Remove `HeroUIProvider`, the v2 Tailwind plugin, and obsolete package configuration.
- [x] Add the Tailwind CSS v4 HeroUI stylesheet and move custom animation tokens to CSS.
- [x] Migrate buttons, cards, chips, avatars, alerts, fields, toggles, and feedback components.
- [x] Migrate modals, drawers, dropdowns, tooltips, and overlay state.
- [x] Migrate tables, tabs, accordions, selection types, and collection adapters.
- [x] Replace removed layout, image, code, snippet, user, and navbar components.
- [x] Replace v2 theme utilities with v3 semantic tokens and standard Tailwind utilities.
- [x] Preserve application-owned Framer Motion animations.

## Verification

- [x] No imports remain from removed HeroUI v2 packages.
- [x] No v2 theme utility classes remain.
- [x] `pnpm exec tsc --noEmit` passes.
- [x] `pnpm lint` completes with no errors (existing warnings remain).
- [x] `pnpm build` completes successfully for all application routes.
- [x] A fresh development server returns HTTP 200 for `/`, authentication,
      flows, projects, alerts, and portal routes.

Authenticated visual interaction testing still requires representative production data,
especially for destructive dialogs, collection selection, the flow DAG editor, and project
administration workflows.
