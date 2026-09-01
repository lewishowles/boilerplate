#!/usr/bin/env bash
# Installs dependencies and runs lint, one-shot unit tests, and the build for one
# generated project, so a complete generated starter is checked end to end.
#
# The filename deliberately does not match the check-*.sh pattern that
# verify-generated-projects.sh auto-discovers, so this runs only when that script
# is given --build. It calls only the lint, unit, and build scripts, never the
# Playwright test:e2e or test:component scripts.
#
# All output is appended to <log-path>; the run stops at the first failing step.

set -euo pipefail

if (( $# != 3 )); then
	printf 'Usage: %s <mode> <project-path> <log-path>\n' "$0" >&2
	exit 2
fi

mode="$1"  # API mode being built, recorded at the top of the log.
project_path="$2"  # Generated project to install and build.
log_path="$3"  # File to append all install and build output to.

# Run the sequence with every command's output appended to the log. set -e stops
# the group at the first failure, which exits the script non-zero.
#
# VP_GIT_HOOKS=0 stops the generated project's `prepare` script
# (`vp config --no-agent`) from prompting to install the Git hook dispatcher,
# which would hang this unattended run. The dispatcher is not needed to lint,
# test, or build.
#
# Each command is preceded by a `Step:` line so the log shows which sub-step
# failed without relying on error-text matching.
{
	printf 'Build mode: %s\n' "$mode"
	cd "$project_path"
	printf 'Step: bun install --frozen-lockfile\n'
	VP_GIT_HOOKS=0 bun install --frozen-lockfile
	printf 'Step: bun run lint\n'
	bun run lint
	printf 'Step: bun run test:unit:run\n'
	bun run test:unit:run
	printf 'Step: bun run build\n'
	bun run build
} >>"$log_path" 2>&1
