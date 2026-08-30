#!/usr/bin/env bash
# Checks that a generated project contains exactly the API transport and adapter
# files for its mode, and none belonging to another mode.
#
# Usage: check-api-structure.sh <mode> <project-path>
#   mode: fetch | xano | xano-grouped
#
# Prints one PASS/FAIL line per assertion group and exits non-zero if any group
# fails. The assertion functions below define the expected and forbidden paths
# for each mode.

set -euo pipefail

script_directory="$(cd "$(dirname "$0")" && pwd)"  # Directory holding this module and lib.sh.
source "$script_directory/lib.sh"

if (( $# != 2 )); then
	printf 'Usage: %s <mode> <project-path>\n' "$0" >&2
	exit 2
fi

# tool: command needed by the assertions in this module.
for tool in node rg; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

mode="$1"  # API mode to check.
project_path="$2"  # Root of the generated project.
requested_path="$project_path"  # Caller's path as given, kept for the resolution-failure message below.
failed_groups=0  # Count of assertion groups that failed; non-zero sets the exit status.

if [[ ! -d "$project_path" ]]; then
	printf 'Project directory not found: %s\n' "$project_path" >&2
	exit 1
fi

# Resolve to an absolute path so the dependency check's `require()` treats it as a
# file path rather than a module name when the caller passes a relative path.
if ! project_path="$(cd "$project_path" && pwd)"; then
	printf 'Project directory could not be resolved: %s\n' "$requested_path" >&2
	exit 1
fi

# Runs one assertion group, prints its PASS/FAIL line, and counts failures.
#
# @param  {string}  group_name
#     Name to print for this group.
# @param  {string}  ...
#     Command and arguments to run; the group passes when it exits 0.
run_group() {
	local group_name="$1"  # Name to print for this group.
	shift

	if "$@"; then
		report_result PASS "$group_name"
		return 0
	fi

	report_result FAIL "$group_name"
	failed_groups=$((failed_groups + 1))
}

# Fetch mode: the fetch API composable, its test, and the auth API composable.
check_fetch_composables() {
	assert_file_present "$project_path" 'src/composables/api/use-api/index.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-api/index.test.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-auth-api/index.js'
}

# Fetch mode: no Xano source files and no Xano SDK dependency remain.
check_fetch_exclusions() {
	assert_no_match "$project_path" 'src/composables/api/xano/**' &&
		assert_dependency_absent "$project_path" '@xano/js-sdk'
}

# Single-group Xano mode: the Xano composable, API, client, auth composable, and
# the Xano SDK dependency.
check_xano_structure() {
	assert_file_present "$project_path" 'src/composables/api/xano/use-api/index.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/use-api/index.test.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/xano-api.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/xano-api.test.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/xano-client.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-auth-api/index.js' &&
		assert_dependency_present "$project_path" '@xano/js-sdk'
}

# Single-group Xano mode: no fetch composable, no grouped Xano files, and no
# group adapter.
check_xano_exclusions() {
	assert_no_match "$project_path" 'src/composables/api/use-api/**' &&
		assert_no_match "$project_path" 'src/composables/api/xano/grouped/**' &&
		assert_no_match "$project_path" 'src/composables/api/use-group-api/**'
}

# Grouped Xano mode: the grouped composable and client, the shared Xano API,
# separate auth and group composables, and the Xano SDK dependency.
check_grouped_xano_structure() {
	assert_file_present "$project_path" 'src/composables/api/xano/grouped/use-api/index.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/grouped/xano-client.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/xano-api.js' &&
		assert_file_present "$project_path" 'src/composables/api/xano/xano-api.test.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-auth-api/index.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-group-api/index.js' &&
		assert_file_present "$project_path" 'src/composables/api/use-group-api/index.test.js' &&
		assert_dependency_present "$project_path" '@xano/js-sdk'
}

# Grouped Xano mode: no single-group Xano composable or client.
check_grouped_xano_exclusions() {
	assert_no_match "$project_path" 'src/composables/api/xano/use-api/**' &&
		assert_file_absent "$project_path" 'src/composables/api/xano/xano-client.js'
}

case "$mode" in
	fetch)
		run_group 'fetch API composables' check_fetch_composables
		run_group 'fetch Xano exclusions' check_fetch_exclusions
		;;
	xano)
		run_group 'single-group Xano structure' check_xano_structure
		run_group 'single-group Xano exclusions' check_xano_exclusions
		;;
	xano-grouped)
		run_group 'grouped Xano structure' check_grouped_xano_structure
		run_group 'grouped Xano exclusions' check_grouped_xano_exclusions
		;;
	*)
		printf 'Unsupported API mode: %s\n' "$mode" >&2
		exit 2
		;;
esac

if (( failed_groups > 0 )); then
	exit 1
fi
