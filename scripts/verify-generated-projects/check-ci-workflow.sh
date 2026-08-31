#!/usr/bin/env bash
# Statically checks the CI workflow in one generated project.
#
# Usage: check-ci-workflow.sh <mode> <project-path>
#   mode: fetch | xano | xano-grouped
#
# Reads the generated .github/workflows/ci.yml and confirms it installs from the
# committed lockfile with the repository's Bun version and runs lint, one-shot
# unit tests, and build through package scripts. It also rejects browser test
# steps, publish or deploy steps, repository secret usage, and any action beyond
# the pinned setup actions the template already uses. The workflow and its
# actions are never executed.
#
# Prints one PASS/FAIL line for the generated project and exits non-zero on any
# missing requirement or forbidden content.

set -euo pipefail

script_directory="$(cd "$(dirname "$0")" && pwd)"  # Directory holding this module and lib.sh.
source "$script_directory/lib.sh"

if (( $# != 2 )); then
	printf 'Usage: %s <mode> <project-path>\n' "$0" >&2
	exit 2
fi

if ! command -v bun >/dev/null 2>&1; then
	printf 'Required command not found: bun\n' >&2
	exit 1
fi

mode="$1"  # Generated API mode, included in the single result line.
project_path="$2"  # Root directory of the generated project under test.
ci_workflow_path="$project_path/.github/workflows/ci.yml"  # Workflow file to inspect.
failure_reason=''  # Reason printed if any check fails; empty means every check passed.

# The workflow assertions run in a single Bun script so the YAML is parsed once
# with the runtime's built-in parser. The script prints its first failure reason
# and exits 1; on success it prints nothing and exits 0.
if [[ ! -d "$project_path" ]]; then
	failure_reason='project directory not found'
elif ! assert_file_present "$project_path" '.github/workflows/ci.yml'; then
	failure_reason='CI workflow file not found'
elif ! failure_reason="$(bun -e '
const workflowPath = process.argv[1];
const rawWorkflow = await Bun.file(workflowPath).text();
let workflow;
let failureReason = "";

// Bun below 1.2.10 has no YAML parser; report that plainly rather than letting
// the parse throw and be misread as a malformed workflow.
if (typeof Bun.YAML?.parse !== "function") {
	failureReason = "Bun YAML parser is unavailable";
} else {
	try {
		workflow = Bun.YAML.parse(rawWorkflow);
	} catch {
		failureReason = "CI workflow is not valid YAML";
	}
}

if (!failureReason && (!workflow || typeof workflow !== "object" || Array.isArray(workflow))) {
	failureReason = "CI workflow YAML is not an object";
}

// Every job step, and every "uses" value found anywhere in the document. The
// uses values are collected recursively so a step nested in a reusable job or
// composite block cannot bypass the action allowlist.
const steps = [];
const allUses = [];

if (!failureReason) {
	const jobs = workflow.jobs;

	if (!jobs || typeof jobs !== "object" || Array.isArray(jobs)) {
		failureReason = "CI workflow has no jobs";
	} else {
		for (const job of Object.values(jobs)) {
			if (!job || typeof job !== "object" || Array.isArray(job) || !Array.isArray(job.steps)) {
				continue;
			}

			for (const step of job.steps) {
				if (step && typeof step === "object" && !Array.isArray(step)) {
					steps.push(step);
				}
			}
		}
	}

	const valuesToInspect = [workflow];

	while (valuesToInspect.length > 0) {
		const value = valuesToInspect.pop();

		if (Array.isArray(value)) {
			for (const item of value) {
				valuesToInspect.push(item);
			}
		} else if (value && typeof value === "object") {
			for (const [key, nestedValue] of Object.entries(value)) {
				if (key === "uses") {
					allUses.push(nestedValue);
				}

				valuesToInspect.push(nestedValue);
			}
		}
	}
}

// The Bun version must come from the file the repository declares, not a version
// pinned inline in the workflow.
let bunSetupStep;

if (!failureReason) {
	for (const step of steps) {
		if (typeof step.uses === "string" && step.uses.startsWith("oven-sh/setup-bun")) {
			bunSetupStep = step;
			break;
		}
	}

	if (!bunSetupStep || !bunSetupStep.with || bunSetupStep.with["bun-version-file"] !== "package.json") {
		failureReason = "setup-bun must use package.json as its version file";
	} else if (Object.hasOwn(bunSetupStep.with, "bun-version")) {
		failureReason = "setup-bun must not pin bun-version inline";
	}
}

// The install must use the committed lockfile unchanged, and lint, one-shot unit
// tests, and build must each run through a package script.
let hasFrozenInstall = false;
let hasLint = false;
let hasUnitTests = false;
let hasBuild = false;

if (!failureReason) {
	for (const step of steps) {
		const run = step.run;

		if (typeof run !== "string") {
			continue;
		}

		if (run.includes("bun install --frozen-lockfile")) {
			hasFrozenInstall = true;
		}

		if (run.includes("bun update") || run.includes("--no-frozen-lockfile")) {
			failureReason = "CI workflow changes the lockfile during installation";
			break;
		}

		if (run.includes("bun run lint")) {
			hasLint = true;
		}

		if (run.includes("bun run test:unit:run")) {
			hasUnitTests = true;
		}

		if (run.includes("bun run build")) {
			hasBuild = true;
		}
	}
}

if (!failureReason && !hasFrozenInstall) {
	failureReason = "CI workflow does not install with bun install --frozen-lockfile";
}

if (!failureReason && !hasLint) {
	failureReason = "CI workflow does not run bun run lint";
}

if (!failureReason && !hasUnitTests) {
	failureReason = "CI workflow does not run bun run test:unit:run";
}

if (!failureReason && !hasBuild) {
	failureReason = "CI workflow does not run bun run build";
}

// Reject browser test steps and any publish or deploy command.
if (!failureReason) {
	for (const step of steps) {
		for (const value of [step.name, step.run, step.uses]) {
			if (typeof value === "string" && /playwright|cypress/i.test(value)) {
				failureReason = "CI workflow includes a browser test step";
				break;
			}
		}

		if (failureReason) {
			break;
		}

		if (typeof step.run === "string" && /\b(publish|deploy)\b/i.test(step.run)) {
			failureReason = "CI workflow includes a publish or deploy command";
			break;
		}
	}
}

// Every action must be pinned to a ref and named in the allowlist, so the
// workflow cannot call another repository or a deploy action.
if (!failureReason) {
	for (const uses of allUses) {
		if (typeof uses !== "string") {
			failureReason = "CI workflow has a non-string uses value";
			break;
		}

		if (/deploy|gh-pages|pages-deploy/i.test(uses)) {
			failureReason = `CI workflow includes a deploy action: ${uses}`;
			break;
		}

		const atIndex = uses.lastIndexOf("@");
		const actionId = uses.slice(0, atIndex);
		const actionRef = uses.slice(atIndex + 1);

		if (
			atIndex <= 0 ||
			!actionRef ||
			(actionId !== "actions/checkout" && actionId !== "oven-sh/setup-bun")
		) {
			failureReason = `CI workflow uses an unapproved action: ${uses}`;
			break;
		}
	}
}

if (!failureReason && rawWorkflow.includes("secrets.")) {
	failureReason = "CI workflow references repository secrets";
}

if (failureReason) {
	console.log(failureReason);
	process.exit(1);
}
' "$ci_workflow_path" 2>&1)"; then
	if [[ -z "$failure_reason" ]]; then
		failure_reason='CI workflow check failed'
	fi
fi

if [[ -n "$failure_reason" ]]; then
	printf 'FAIL %s  ci-workflow  error: %s\n' "$mode" "$failure_reason"
	exit 1
fi

report_result PASS "$mode ci-workflow"
