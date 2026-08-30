#!/usr/bin/env bash
# Generates a boilerplate project for every supported API mode in a throwaway
# directory and runs each check module against it, so the template's final file
# selection, dependencies, and auth routing are checked as a complete output.
#
# Run order:
#   1. Guard required tools and locate the check-module directory.
#   2. Resolve the boilerplate source (local checkout, or its origin remote).
#   3. For each mode (fetch, xano, xano-grouped): generate the project, then run
#      every scripts/verify-generated-projects/check-*.sh against it.
#   4. On success remove the run directory; on any failure keep it for diagnosis.
#
# This is the fast static matrix: no dependency installation and no network
# access beyond the generator itself. The opt-in smoke path is a later addition.

set -euo pipefail

# Prints the single-line invocation form to stderr.
usage() {
	printf 'Usage: %s (takes no arguments)\n' "$0" >&2
}

# Prints the first log line that looks like a failure, falling back to the first
# non-blank line and then to a fixed message. Keeps failure reporting to one
# line while pointing the reader at the full log.
#
# @param  {string}  log_path
#     Captured command log to scan.
first_error_line() {
	local log_path="$1"  # Captured command log to scan.
	local error_line  # Candidate line to print, reused across the two searches.

	error_line="$(rg --max-count 1 --ignore-case 'error|failed|fatal' "$log_path" || true)"

	if [[ -n "$error_line" ]]; then
		printf '%s\n' "$error_line"
		return 0
	fi

	error_line="$(rg -m 1 '\S' "$log_path" || true)"

	if [[ -n "$error_line" ]]; then
		printf '%s\n' "$error_line"
		return 0
	fi

	printf 'No output captured\n'
}

# Resolves the value to pass to `boilersuit new --boilerplate`. Prefers the
# local checkout when Git accepts it as a source; otherwise uses the origin
# remote URL.
#
# @param  {string}  local_source
#     Path to the local boilerplate checkout (the repository root).
resolve_boilerplate_source() {
	local local_source="$1"  # Local boilerplate checkout to test as a Git source.

	if git -C "$local_source" ls-remote "$local_source" HEAD >/dev/null 2>&1; then
		printf '%s\n' "$local_source"
		return 0
	fi

	git -C "$local_source" remote get-url origin
}

# Runs the generator once for a single API mode with fixed, safe setup values.
# No live endpoint, credential, or remote command is supplied.
#
# @param  {string}  mode
#     API mode to generate (fetch, xano, or xano-grouped).
# @param  {string}  boilerplate_source
#     Value for --boilerplate: a local path or a Git URL.
# @param  {string}  mode_parent
#     Directory the project is created inside.
# @param  {string}  project_name
#     Name for the generated project directory.
generate_project() {
	local mode="$1"  # API mode to generate.
	local boilerplate_source="$2"  # --boilerplate value: local path or Git URL.
	local mode_parent="$3"  # Directory to create the project inside.
	local project_name="$4"  # Generated project directory name.

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

# Runs every check module found at startup against one generated project.
#
# @param  {string}  mode
#     API mode being checked, passed through to each module.
# @param  {string}  project_path
#     Path to the generated project to check.
# @param  {string}  mode_parent
#     Directory to write each module's log into.
run_checks() {
	local mode="$1"  # API mode being checked.
	local project_path="$2"  # Generated project to check.
	local mode_parent="$3"  # Directory for per-module logs.
	local check_path  # Path of the check module being run.
	local check_name  # Module name without directory or .sh suffix.
	local check_log_path  # Log file for the current module.
	local -a failed_check_names=()  # Names of check modules that failed for this mode.

	# Iterate the module list validated at startup rather than re-globbing, so a
	# mode cannot pass with zero checks if the check directory is emptied while
	# the run is in progress.
	for check_path in "${check_modules[@]}"; do
		check_name="$(basename "$check_path" .sh)"
		check_log_path="$mode_parent/$check_name.log"

		if ! "$check_path" "$mode" "$project_path" >"$check_log_path" 2>&1; then
			printf 'FAIL %s  %s  %s  %s\n' "$mode" "$check_name" "$(first_error_line "$check_log_path")" "$check_log_path"
			failed_check_names+=("$check_name")
		fi
	done

	if (( ${#failed_check_names[@]} > 0 )); then
		printf 'FAIL %s  checks  %s\n' "$mode" "${failed_check_names[*]}"
		return 1
	fi

	return 0
}

# Generates one API mode and runs all checks against it, capturing generator and
# check output to logs. Prints a single PASS or FAIL line for the mode; a
# failing mode returns non-zero without aborting the other modes.
#
# @param  {string}  mode
#     API mode to verify.
# @param  {string}  boilerplate_source
#     Value for --boilerplate passed to the generator.
verify_mode() {
	local mode="$1"  # API mode to verify.
	local boilerplate_source="$2"  # --boilerplate value passed to the generator.
	local mode_parent="$run_directory/$mode"  # Per-mode working directory.
	local generation_log_path="$mode_parent/generate.log"  # Generator output log.
	local project_name="verify-$mode"  # Generated project directory name.
	local project_path="$mode_parent/$project_name"  # Path to the generated project.

	if ! mkdir "$mode_parent"; then
		printf 'FAIL %s  generate  Could not create mode directory  %s\n' "$mode" "$mode_parent"
		return 1
	fi

	if ! generate_project "$mode" "$boilerplate_source" "$mode_parent" "$project_name" >"$generation_log_path" 2>&1; then
		printf 'FAIL %s  generate  %s  %s\n' "$mode" "$(first_error_line "$generation_log_path")" "$generation_log_path"
		return 1
	fi

	if [[ ! -d "$project_path" ]]; then
		printf 'FAIL %s  generate  Project directory not created  %s\n' "$mode" "$generation_log_path"
		return 1
	fi

	if ! run_checks "$mode" "$project_path" "$mode_parent"; then
		return 1
	fi

	printf 'PASS %s\n' "$mode"
}

if (( $# > 0 )); then
	usage
	exit 2
fi

# Fail early if any required command is missing. tool: the command being checked.
for tool in git boilersuit rg trash; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

checks_directory="$(dirname "$0")/verify-generated-projects"  # Directory holding the check modules.

if [[ ! -d "$checks_directory" ]]; then
	printf 'Check directory not found: %s\n' "$checks_directory" >&2
	exit 1
fi

shopt -s nullglob
check_modules=("${checks_directory}"/check-*.sh)  # Every check module found in the check directory.

if (( ${#check_modules[@]} == 0 )); then
	printf 'No check modules found: %s\n' "$checks_directory" >&2
	exit 1
fi

# check_module: module path being checked for the executable bit.
for check_module in "${check_modules[@]}"; do
	if [[ ! -x "$check_module" ]]; then
		printf 'Check module is not executable: %s\n' "$check_module" >&2
		exit 1
	fi
done

modes=(fetch xano xano-grouped)  # API modes to generate and check, in run order.
repo_root="$(git rev-parse --show-toplevel)"  # Boilerplate checkout root.
boilerplate_source="$(resolve_boilerplate_source "$repo_root")"  # --boilerplate value for the generator.
run_directory="$(mktemp -d "${TMPDIR:-/tmp}/boilerplate-generated-projects.XXXXXX")"  # Throwaway parent for all generated projects and logs.
failed_modes=0  # Count of modes that failed; non-zero sets the exit status.

printf 'Source: %s\n' "$boilerplate_source"
printf 'Run directory: %s\n' "$run_directory"

# mode: API mode being verified this iteration.
for mode in "${modes[@]}"; do
	if ! verify_mode "$mode" "$boilerplate_source"; then
		failed_modes=$((failed_modes + 1))
	fi
done

if (( failed_modes > 0 )); then
	printf 'Run directory retained: %s\n' "$run_directory"
	exit 1
fi

trash "$run_directory"
