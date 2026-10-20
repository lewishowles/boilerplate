#!/usr/bin/env bash
# Copies the working tree, including uncommitted changes, into a throwaway
# directory, generates a boilerplate project from it for every supported API
# mode, and runs each check module against the result. This checks the template's
# final file selection, dependencies, and auth routing as a complete output.
#
# Run order:
#   1. Guard required tools and locate the check-module directory.
#   2. Copy the current working tree into a throwaway Git repository.
#   3. For each mode (fetch, xano, xano-grouped): generate the project, then run
#      every scripts/verify-generated-projects/check-*.sh against it. With --build,
#      also run install-and-build.sh (install, lint, unit tests, build) after the
#      check modules pass.
#   4. On success remove the run directory; on any failure keep it for diagnosis.
#
# This is the fast static matrix: no dependency installation and no network
# access beyond the generator itself. Pass --build to also install dependencies,
# run lint and one-shot unit tests, then build each generated project.

set -euo pipefail

# Prints the single-line invocation form to stderr.
usage() {
	printf 'Usage: %s [--build]\n' "$0" >&2
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

# Copies tracked and untracked, non-ignored files as they are on disk into a
# throwaway Git repository for Boilersuit to clone.
#
# @param  {string}  source_root
#     Path to the boilerplate working tree.
# @param  {string}  snapshot_root
#     Path for the throwaway Git repository.
snapshot_working_tree() {
	local source_root="$1"  # Boilerplate working tree to copy.
	local snapshot_root="$2"  # Throwaway repository to create.
	local file_list="$run_directory/source-files"  # NUL-separated paths to copy.
	local file_path  # Relative path of a tracked or eligible untracked file.
	local source_path  # Full path of that file in the working tree.

	# Listing uses the user's Git configuration so their global ignore rules apply.
	git -C "$source_root" ls-files -z --cached --others --exclude-standard > "$file_list"
	mkdir -p "$snapshot_root"

	while IFS= read -r -d '' file_path; do
		source_path="$source_root/$file_path"

		# Leave deleted files out, but keep symlinks with missing targets.
		if [[ ! -e "$source_path" && ! -L "$source_path" ]]; then
			continue
		fi

		# Git lists an untracked nested repository as a directory entry.
		if [[ -d "$source_path" && ! -L "$source_path" ]]; then
			continue
		fi

		mkdir -p "$snapshot_root/$(dirname "$file_path")"
		cp -Pp "$source_path" "$snapshot_root/$file_path"
	done < "$file_list"

	local -x GIT_CONFIG_GLOBAL=/dev/null  # Keep the user's Git configuration out of the throwaway repository.
	local -x GIT_CONFIG_NOSYSTEM=1  # Keep system Git configuration out of the throwaway repository.

	git init -q -b main "$snapshot_root"

	# Give the throwaway repository its own identity so the commit does not
	# depend on the user's or system's Git configuration.
	git -C "$snapshot_root" config user.name 'Generated project verification'
	git -C "$snapshot_root" config user.email 'verify-generated-projects@example.invalid'

	# Force-add so files the working tree tracks despite an ignore pattern stay
	# in the snapshot.
	git -C "$snapshot_root" add -f --all
	git -C "$snapshot_root" commit -qm 'Snapshot the current working tree'
}

# Runs the generator once for a single API mode with fixed, safe setup values.
# No live endpoint, credential, or remote command is supplied.
#
# @param  {string}  mode
#     API mode to generate (fetch, xano, or xano-grouped).
# @param  {string}  boilerplate_source
#     Path to the throwaway Git repository.
# @param  {string}  mode_parent
#     Directory the project is created inside.
# @param  {string}  project_name
#     Name for the generated project directory.
generate_project() {
	local mode="$1"  # API mode to generate.
	local boilerplate_source="$2"  # Throwaway repository passed to --boilerplate.
	local mode_parent="$3"  # Directory to create the project inside.
	local project_name="$4"  # Generated project directory name.

	boilersuit new "$project_name" \
		--boilerplate "$boilerplate_source" \
		--parent "$mode_parent" \
		--setup "PROJECT_NAME=$project_name" \
		--setup "SITE_TITLE=Generated project check" \
		--setup "SITE_DESCRIPTION=Boilerplate output check." \
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
# failing mode returns non-zero without aborting the other modes. When --build is
# set, installs dependencies and builds the generated project after its checks
# pass.
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

	if (( build_enabled )); then
		local build_log_path="$run_directory/$mode-build.log"  # Install and build log for this mode.

		if ! "$install_and_build_path" "$mode" "$project_path" "$build_log_path"; then
			printf 'FAIL %s  build  %s  %s\n' "$mode" "$(first_error_line "$build_log_path")" "$build_log_path"
			return 1
		fi
	fi

	printf 'PASS %s\n' "$mode"
}

build_enabled=0  # 1 when --build was passed, enabling the install and build step.

if (( $# == 1 )) && [[ "$1" == "--build" ]]; then
	build_enabled=1
elif (( $# > 0 )); then
	usage
	exit 2
fi

# Fail early if any required command is missing. tool: the command being checked.
required_tools=(git boilersuit rg trash)  # Commands the fast matrix needs; --build adds bun.

if (( build_enabled )); then
	required_tools+=(bun)
fi

for tool in "${required_tools[@]}"; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

checks_directory="$(dirname "$0")/verify-generated-projects"  # Directory holding the check modules.
install_and_build_path="$checks_directory/install-and-build.sh"  # Install and build script, run only under --build.

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

if (( build_enabled )) && [[ ! -x "$install_and_build_path" ]]; then
	printf 'Install-and-build check is not executable: %s\n' "$install_and_build_path" >&2
	exit 1
fi

modes=(fetch xano xano-grouped)  # API modes to generate and check, in run order.
repo_root="$(git rev-parse --show-toplevel)"  # Boilerplate checkout root.
run_directory="$(mktemp -d "${TMPDIR:-/tmp}/boilerplate-generated-projects.XXXXXX")"  # Throwaway parent for all generated projects and logs.
boilerplate_source="$run_directory/boilerplate-source"  # Throwaway Git repository for the generator.
failed_modes=0  # Count of modes that failed; non-zero sets the exit status.

printf 'Source: %s\n' "$boilerplate_source"
printf 'Run directory: %s\n' "$run_directory"

snapshot_working_tree "$repo_root" "$boilerplate_source"

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
