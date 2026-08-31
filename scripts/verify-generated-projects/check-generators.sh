#!/usr/bin/env bash
# Checks that every supported Boilersuit generator is discoverable and that
# their definitions pass doctor checks in one generated project.
#
# Usage: check-generators.sh <mode> <project-path>
#   mode: fetch | xano | xano-grouped
#
# Prints one PASS/FAIL line for the generated project. It checks definitions
# only and never runs a generator that could write project files.

set -euo pipefail

script_directory="$(cd "$(dirname "$0")" && pwd)"  # Directory holding this module and lib.sh.
source "$script_directory/lib.sh"

if (( $# != 2 )); then
	printf 'Usage: %s <mode> <project-path>\n' "$0" >&2
	exit 2
fi

# tool: command needed to inspect installed generator definitions.
for tool in boilersuit node; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

mode="$1"  # Generated API mode, included in the single result line.
project_path="$2"  # Root directory of the generated project under test.
generators_json=''  # JSON returned by generator discovery.
doctor_json=''  # JSON returned by the generator doctor command.
missing_generator_ids=''  # Newline-separated required IDs absent from discovery output.
failure_reason=''  # Reason printed if any discovery or doctor step fails.
doctor_status=0  # Exit status from the doctor command, retained while inspecting JSON output.

if [[ ! -d "$project_path" ]]; then
	printf 'FAIL %s  generators  error: project directory not found\n' "$mode"
	exit 1
fi

if ! generators_json="$(boilersuit generators list --json)"; then
	failure_reason='generator discovery command failed'
else
	if ! missing_generator_ids="$(node -e '
const generatorList = JSON.parse(process.argv[1]);
const generators = Array.isArray(generatorList)
	? generatorList
	: generatorList.generators;
const requiredIds = [
	"add-edit-form",
	"component",
	"composable",
	"pinia-colada-domain",
	"server-table-composable",
	"server-table-fragment",
	"table-fragment",
];

if (!Array.isArray(generators)) {
	process.exit(2);
}

const discoveredIds = new Set(generators.map((generator) => generator.id));
const missingIds = requiredIds.filter((id) => !discoveredIds.has(id));
process.stdout.write(missingIds.join(","));
' "$generators_json")"; then
		failure_reason='generator discovery returned invalid JSON'
	elif [[ -n "$missing_generator_ids" ]]; then
		failure_reason="missing generator IDs: $missing_generator_ids"
	fi
fi

if [[ -z "$failure_reason" ]]; then
	doctor_json="$(boilersuit generators doctor "$project_path" --json \
		--field NAME=verify-items \
		--field SINGULAR_NAME=verify-item \
		--field ID_NAME=id \
		--field ENDPOINT=/api/items)" || doctor_status=$?

	if (( doctor_status != 0 )); then
		failure_reason='generator doctor command failed'
	elif ! node -e '
const doctorResult = JSON.parse(process.argv[1]);
const errors = doctorResult.errors;

if (!Array.isArray(errors)) {
	process.exit(2);
}

process.exit(Number(errors.length > 0));
' "$doctor_json"; then
		failure_reason='generator doctor reported errors'
	fi
fi

if [[ -n "$failure_reason" ]]; then
	printf 'FAIL %s  generators  error: %s\n' "$mode" "$failure_reason"
	exit 1
fi

report_result PASS "$mode generators"
