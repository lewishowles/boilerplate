#!/usr/bin/env bash
# Checks that the verify-generated-projects harness is absent from a generated
# project. The orchestrator script and this check directory are template-only;
# .boilersuit/setup.json excludes scripts/** from generated trees, and this
# module guards against that exclusion regressing.
#
# Usage: check-harness-excluded.sh <mode> <project-path>

set -euo pipefail

script_directory="$(cd "$(dirname "$0")" && pwd)"  # Directory holding this module and lib.sh.
source "$script_directory/lib.sh"

if (( $# != 2 )); then
	printf 'Usage: %s <mode> <project-path>\n' "$0" >&2
	exit 2
fi

mode="$1"  # API mode, used only in the result line.
project_path="$2"  # Root of the generated project.
leaked_path=''  # Set to the harness path that leaked, for the failure line.

if [[ ! -d "$project_path" ]]; then
	printf 'Project directory not found: %s\n' "$project_path" >&2
	exit 1
fi

if assert_file_absent "$project_path" 'scripts/verify-generated-projects.sh' &&
	assert_file_absent "$project_path" 'scripts/verify-generated-projects'; then
	report_result PASS "$mode harness excluded"
	exit 0
fi

if [[ -e "$project_path/scripts/verify-generated-projects.sh" ]]; then
	leaked_path='scripts/verify-generated-projects.sh'
else
	leaked_path='scripts/verify-generated-projects'
fi

report_result FAIL "$mode harness leaked: $leaked_path"
exit 1
