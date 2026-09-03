# Verifying generated starter projects

`scripts/verify-generated-projects.sh` generates a full project for every
supported API mode (`fetch`, `xano`, `xano-grouped`) in a throwaway directory
and checks each one as a finished output: file selection, dependency pruning,
auth routing, Boilersuit token resolution, the starter generators, and the
generated CI workflow. It exists because the template and each generator can
pass their own focused checks while a fully generated project still ends up with
the wrong files, unresolved tokens, or unused dependencies.

This script and the `verify-generated-projects/` check modules are template-only.
`.boilersuit/setup.json` excludes `scripts/**` from generated projects, and
`check-harness-excluded.sh` fails the run if that exclusion regresses.

## Commands

```bash
scripts/verify-generated-projects.sh          # generate and statically check all three modes
scripts/verify-generated-projects.sh --build  # also install and run lint, unit tests, and build per mode
```

The default run needs `git`, `boilersuit`, `rg`, and `trash`, makes no network
request, and installs nothing. `--build` also needs `bun`, installs
dependencies from each generated lockfile, and builds every mode, so run it only
with explicit approval. Neither path runs Playwright (`test:component`,
`test:e2e`).

## Output and cleanup

Each run works in a `mktemp` directory under `$TMPDIR`
(`boilerplate-generated-projects.*`), printed at the start, with per-mode
generation, check, and build logs inside it. When every mode passes, the
directory is removed with `trash`. When any mode fails, the run prints
`Run directory retained: <path>` and exits non-zero; `trash` it once you have
read the logs.

## `--build` does not pass yet

Two Boilersuit defects stop `--build` from going green, so treat a `--build`
failure as expected until they are fixed:

- Boilersuit's `package.json` rewrite produces output that `vp check` reports as
  mis-formatted, so `bun run lint` fails in a generated project.
- Boilersuit edits `package.json` dependencies but never reconciles the copied
  `bun.lock` and runs no post-generate install, so a frozen `bun install` fails
  for any mode whose dependencies differ from the template.

The `starter-generation-matrix` task decision record has the detail.
