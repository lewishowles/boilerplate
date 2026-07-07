# {{ PROJECT_NAME }}

A Vue 3 app built on Vite (via `vite-plus`), Vue Router, Pinia, Pinia Colada, Tailwind, and the `@lewishowles/*` component/helper/testing/lint ecosystem.

## Requirements

- macOS
- Bun

## Getting started

```bash
bun install
bun run dev
```

## Common commands

```bash
bun run dev            # Start the dev server
bun run build           # Build for production
bun run preview         # Preview the production build

bun run test:unit:run   # Run unit tests once
bun run test:unit       # Run unit tests in watch mode
bun run test:ct         # Run Playwright component tests
bun run test:e2e        # Run Playwright end-to-end tests

bun run check           # Format and lint (oxfmt + oxlint), auto-fixing
```

## Dependencies

`@lewishowles/components`, `@lewishowles/helpers`, `@lewishowles/testing`, and `@lewishowles/lint-config` use `^` ranges, so a project picks up patch and minor releases automatically. Toolchain packages (`vite`, `vite-plus`, `vitest`, Playwright, and related plugins) are pinned to exact versions instead, so upgrades are a deliberate choice rather than silent drift. Check `package.json` for current versions.

## Testing

Unit tests run on Vitest (via `vite-plus`) and use `@lewishowles/testing/vue` for component mounting (`createMount`, `createDeepMount`) and composable testing (`withAppContext`), and `@lewishowles/testing/vitest` for `localStorage` mocking and console suppression: see `test/unit/setup.js`. Component and end-to-end tests run on Playwright, sharing config presets from `@lewishowles/testing/playwright`.

## Modal support

`<modal-controller />` and an unsaved-changes guard (`installUnsavedChangesGuard`) are wired up by default in `src/App.vue` and `src/router/index.js`, so any component can open a modal via `useModalDialog` or use `useForm`'s `unsavedChangesGuard` option with zero extra setup. Both are inert until you actually use them. To remove: delete the `<modal-controller />` line from `src/App.vue`, and the `router.afterEach`/`installUnsavedChangesGuard` calls from `src/router/index.js`.

There's no modal-form component or generator yet: that's a deliberately deferred design decision, not an oversight.

## Linting

`.oxlintrc.json` extends `@lewishowles/lint-config`'s shared `vue.json` layer. Add project-specific rule overrides, ignore patterns, or overrides blocks directly in `.oxlintrc.json`; see the `@lewishowles/lint-config` README for the merge rules.
