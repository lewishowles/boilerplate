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
- `xano-grouped` uses one Xano instance client with `VITE_API_BASE_URL` (the instance URL), `VITE_API_APP_GROUP`, and `VITE_API_AUTH_GROUP`

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

## Add-edit form generator

`boilersuit generate add-edit-form` creates an add/edit form for one resource: a form component plus a focused unit test. The form consumes the `pinia-colada-domain` composables for that resource (`use<Item>` for details, `use<Item>Actions` for create and update) and the local `src/components/form/form-wrapper` extension.

If the record id is missing, the form is in add mode and does not fetch. If it is set, the form is in edit mode, loads that record, and handles the initial load, a load error with retry, the ready state, and a missing record separately. A successful submit emits one `success` event carrying `{ result, formData }`.

### Fields

- `NAME` — collection name, lowercase kebab-case. Locates the query barrel (`@/queries/<NAME>`) and the output folder.
- `SINGULAR_NAME` — item name, lowercase kebab-case. Drives the composable and generated test names.
- `ID_NAME` — id parameter name, camelCase. Used by the details query and the update action.

### Variants

- `--variant page` (default) — a plain form component for a page to own. Navigation and global success messaging stay with the parent.
- `--variant modal` — the same lifecycle wrapped in the Components `modal-dialog`. It re-emits `close` when the dialog emits `dialog:close` and after a successful submit, and makes no routing assumptions.

Only the selected variant's files are generated.

### Commands

```bash
# Preview first (page variant)
boilersuit generate preview add-edit-form --variant page \
	--field NAME=users --field SINGULAR_NAME=user --field ID_NAME=userId

# Generate
boilersuit generate add-edit-form --variant page \
	--field NAME=users --field SINGULAR_NAME=user --field ID_NAME=userId

# Modal variant
boilersuit generate preview add-edit-form --variant modal \
	--field NAME=users --field SINGULAR_NAME=user --field ID_NAME=userId
```

Rerun generation with `--skip-existing` to protect form files you have already edited. Without it, generation overwrites the destination.

### Fields, validation, and mapping

The generated form leaves fields, validation rules, value coercions, and record-to-form mapping as explicit TODO placeholders. It does not derive any of these from OpenAPI. Submit-time API errors, both field and general, flow through the local `form-wrapper` default adapter, `parseApiFieldErrors`.

For the underlying form pattern, see the Components `form-wrapper` docs and snippet:

```bash
node node_modules/@lewishowles/components/bin/cli.js info form-wrapper
node node_modules/@lewishowles/components/bin/cli.js snippet form-wrapper
```

The known-broken upstream `form-wrapper` example is deliberately not copied into boilerplate; fixing it is a separate follow-up in the Components repository.

## Linting

`.oxlintrc.json` extends `@lewishowles/lint-config`'s shared `vue.json` layer. Add project-specific rule overrides, ignore patterns, or overrides blocks directly in `.oxlintrc.json`; see the `@lewishowles/lint-config` README for the merge rules.
