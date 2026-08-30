#!/usr/bin/env bash
# Generates a project for every supported API mode and checks each one was produced.
#
# One temporary run directory is created outside the repository, holding a
# subdirectory and a log file per mode. Each mode runs `boilersuit new` with safe
# placeholder setup values; this stage only asserts that the command succeeds and
# the project directory exists. File, dependency, token, generator, and CI checks
# belong to later chunks. On success the run directory is removed with trash; on
# any failure it is left in place, with every mode's log and partial output, so a
# failure can be inspected.

set -euo pipefail

# Every external command the script cannot run without.
for tool in git boilersuit rg trash; do  # Current command being checked for.
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

# Chooses the boilerplate source passed to `boilersuit new`.
#
# The repository is preferred so local changes are exercised. If it is not a
# usable Git source the origin remote is used instead, which clones its default
# branch.
#
# @param  {string}  local_source
#     Path to the local repository to try first.
resolve_boilerplate_source() {
	local local_source="$1"  # Local repository offered as the boilerplate source.

	if git -C "$local_source" ls-remote "$local_source" HEAD >/dev/null 2>&1; then
		printf '%s\n' "$local_source"
		return 0
	fi

	git -C "$local_source" remote get-url origin
}

# Prints a one-line summary of what went wrong in a generation log.
#
# The first line mentioning an error is used when present, otherwise the first
# non-blank line, so a failing mode reports something useful without dumping the
# whole log.
#
# @param  {string}  log_path
#     Path to the per-mode log file to scan.
first_error_line() {
	local log_path="$1"  # Log file for the failing mode.
	local error_line  # First matching error line, empty when the log has none.

	error_line="$(rg --max-count 1 --ignore-case 'error|failed|fatal' "$log_path" || true)"

	if [[ -n "$error_line" ]]; then
		printf '%s\n' "$error_line"
		return 0
	fi

	rg -m 1 '\S' "$log_path"
}

# Creates the mode's parent directory and generates the project into it.
#
# Kept separate from verify_mode so the whole generation step, including the
# mkdir, is captured in one redirected log while reporting stays in the caller.
#
# @param  {string}  mode
#     API mode name, also used as the API_TYPE setup value.
# @param  {string}  boilerplate_source
#     Source path or URL passed to `boilersuit new --boilerplate`.
# @param  {string}  mode_parent
#     Directory to create and generate the project into.
# @param  {string}  project_name
#     Name of the generated project and its directory.
generate_project() {
	local mode="$1"  # API mode being generated.
	local boilerplate_source="$2"  # Boilerplate source for this run.
	local mode_parent="$3"  # Directory that receives the generated project.
	local project_name="$4"  # Generated project name.

	mkdir "$mode_parent" || return 1

	boilersuit new "$project_name" \
		--boilerplate "$boilerplate_source" \
		--parent "$mode_parent" \
		--setup "PROJECT_NAME=$project_name" \
		--setup "BASE_URL=/" \
		--setup "SITE_TITLE=Generated project check" \
		--setup "SITE_DESCRIPTION=Throwaway project generated to verify boilerplate output." \
		--setup "SITE_URL=https://example.com" \
		--setup "THEME_COLOUR=#ffffff" \
		--setup "API_TYPE=$mode" \
		--json
}

# Generates one API mode and reports whether it was produced.
#
# Prints a single PASS or FAIL line with the log path, and returns non-zero on
# failure so the caller can count it.
#
# @param  {string}  mode
#     API mode name (fetch, xano, xano-grouped).
# @param  {string}  boilerplate_source
#     Source path or URL passed through to generate_project.
verify_mode() {
	local mode="$1"  # API mode being verified.
	local boilerplate_source="$2"  # Boilerplate source for this run.
	local mode_parent="$run_directory/$mode"  # Directory holding this mode's generated project.
	local log_path="$run_directory/$mode.log"  # Full output of the generation step for this mode.
	local project_name="verify-$mode"  # Generated project name and its directory name.
	local project_path="$mode_parent/$project_name"  # Expected path of the generated project.

	if generate_project "$mode" "$boilerplate_source" "$mode_parent" "$project_name" >"$log_path" 2>&1 && [[ -d "$project_path" ]]; then
		printf 'PASS %s  %s\n' "$mode" "$log_path"
		return 0
	fi

	local error_line  # Short reason for the failure, taken from the log.
	error_line="$(first_error_line "$log_path")"

	printf 'FAIL %s  %s  %s\n' "$mode" "$log_path" "$error_line"
	return 1
}

modes=(fetch xano xano-grouped)  # Every supported API mode, one generated project each.
repo_root="$(git rev-parse --show-toplevel)"  # Repository root, so the script works from any directory.
boilerplate_source="$(resolve_boilerplate_source "$repo_root")"  # Source handed to every `boilersuit new` call.
run_directory="$(mktemp -d "${TMPDIR:-/tmp}/boilerplate-generated-projects.XXXXXX")"  # Holds every mode's project directory and log, outside the repository.
failed_modes=0  # Count of modes that did not generate cleanly.

printf 'Source: %s\n' "$boilerplate_source"
printf 'Run directory: %s\n' "$run_directory"

for mode in "${modes[@]}"; do  # Current API mode being verified.
	if ! verify_mode "$mode" "$boilerplate_source"; then
		failed_modes=$((failed_modes + 1))
	fi
done

if ((failed_modes > 0)); then
	printf 'Run directory retained: %s\n' "$run_directory"
	exit 1
fi

trash "$run_directory"
