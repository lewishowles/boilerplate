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

## API setup

Choose one API mode when creating a project with `boilersuit new`:

- `fetch` keeps the native fetch client and `VITE_API_BASE_URL`
- `xano` keeps one Xano API-group client and `VITE_API_BASE_URL`
- `xano-grouped` uses one Xano instance client with `VITE_XANO_APP_GROUP` and `VITE_XANO_AUTH_GROUP`

Copy the generated `.env.example` to `.env` and fill in the values for the selected mode. `.env` is ignored by Git. In grouped mode, application queries use `useApi()` and authentication queries use `useAuthApi()`.

Add another grouped API by defining one environment value and a named adapter:

```js
import useGroupApi from "@/composables/api/use-group-api";

const reportsGroupId = import.meta.env.VITE_XANO_REPORTS_GROUP;

export default function useReportsApi() {
	return useGroupApi(reportsGroupId);
}
```

To remove grouping, point authentication calls at `useApi()`, remove `useAuthApi()` and any named group adapters, then remove the grouped environment values.

## Common commands

```bash
bun run dev            # Start the dev server
bun run build           # Build for production
bun run preview         # Preview the production build

bun run test:unit:run   # Run unit tests once
bun run test:unit       # Run unit tests in watch mode
bun run test:component  # Run Playwright component tests
bun run test:e2e        # Run Playwright end-to-end tests

bun run lint            # Check formatting and linting
bun run lint:fix        # Format and lint, auto-fixing where possible
```

## Dependencies

`@lewishowles/components`, `@lewishowles/helpers`, `@lewishowles/testing`, and `@lewishowles/lint-config` use `^` ranges, so a project picks up patch and minor releases automatically. Toolchain packages (`vite`, `vite-plus`, `vitest`, Playwright, and related plugins) are pinned to exact versions instead, so upgrades are a deliberate choice rather than silent drift. Check `package.json` for current versions.

## Testing

Unit tests run on Vitest (via `vite-plus`) and use `@lewishowles/testing/vue` for component mounting (`createMount`, `createDeepMount`) and composable testing (`withAppContext`), and `@lewishowles/testing/vitest` for `localStorage` mocking and console suppression: see `test/unit/setup.js`. Component and end-to-end tests run on Playwright, sharing config presets from `@lewishowles/testing/playwright`.

The router's auth guard (`src/router/middleware/auth.js`) only checks for a truthy `authToken` in `localStorage`; it doesn't validate against a real backend. To browse protected routes locally before a real auth backend exists, run `localStorage.setItem("authToken", "dev")` in devtools and reload.

## Modal support

`<modal-controller />` and an unsaved-changes guard (`installUnsavedChangesGuard`) are wired up by default in `src/App.vue` and `src/router/index.js`, so any component can open a modal via `useModalDialog` or use `useForm`'s `unsavedChangesGuard` option with zero extra setup. Both are inert until you actually use them. To remove: delete the `<modal-controller />` line from `src/App.vue`, and the `router.afterEach`/`installUnsavedChangesGuard` calls from `src/router/index.js`.

There's no modal-form component or generator yet: that's a deliberately deferred design decision, not an oversight.

## Linting

`.oxlintrc.json` extends `@lewishowles/lint-config`'s shared `vue.json` layer. Add project-specific rule overrides, ignore patterns, or overrides blocks directly in `.oxlintrc.json`; see the `@lewishowles/lint-config` README for the merge rules.
