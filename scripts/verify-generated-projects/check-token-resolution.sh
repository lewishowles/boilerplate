#!/usr/bin/env bash
# Scans one generated project for unresolved Boilersuit tokens, confirms the
# matrix's setup values landed in the expected files, and rejects any
# live-looking endpoint or credential in the output.
#
# Usage: check-token-resolution.sh <mode> <project-path>
#   mode: fetch | xano | xano-grouped

set -euo pipefail

script_directory="$(cd "$(dirname "$0")" && pwd)"  # Directory holding this module and lib.sh.
source "$script_directory/lib.sh"

if (( $# != 2 )); then
	printf 'Usage: %s <mode> <project-path>\n' "$0" >&2
	exit 2
fi

# tool: command needed to inspect generated project files and package metadata.
for tool in node rg; do
	if ! command -v "$tool" >/dev/null 2>&1; then
		printf 'Required command not found: %s\n' "$tool" >&2
		exit 1
	fi
done

mode="$1"  # Generated API mode this run is checking.
project_path="$2"  # Root directory of the generated project under test.
failed_stages=0  # Running count of assertion stages that failed.
base_url="/"  # BASE_URL value the matrix passed at generation time.
site_title="Generated project check"  # SITE_TITLE value the matrix passed at generation time.
site_description="Throwaway project generated to verify boilerplate output."  # SITE_DESCRIPTION value the matrix passed at generation time.
site_url="https://example.com"  # SITE_URL value the matrix passed at generation time.
theme_colour="#ffffff"  # THEME_COLOUR value the matrix passed at generation time.

if [[ ! -d "$project_path" ]]; then
	printf 'FAIL %s  project-path  %s:1: project directory not found\n' "$mode" "$project_path"
	exit 1
fi

# Reports one failed assertion stage on stdout, naming the first file and
# line where the problem was found.
#
# @param  {string}  stage
#     Assertion stage that did not pass.
# @param  {string}  location
#     File-and-line reference with a short description of the failure.
fail_stage() {
	local stage="$1"  # Stage name being reported as failed.
	local location="$2"  # File-and-line reference for the failure.

	printf 'FAIL %s  %s  error: %s\n' "$mode" "$stage" "$location"
}

# Runs one assertion stage, prints PASS or leaves it counted as failed, and
# lets the script continue so every stage still runs.
#
# @param  {string}  stage
#     Label to print for this assertion stage.
# @param  {string}  ...
#     Command, with its arguments, that performs the stage.
run_stage() {
	local stage="$1"  # Label for the stage currently running.
	shift

	if "$@"; then
		report_result PASS "$stage"
		return 0
	fi

	failed_stages=$((failed_stages + 1))
}

# Finds the first line in the generated project matching a pattern, ignoring
# node_modules, the Boilersuit generators directory, and lockfiles so only
# generated source is scanned.
#
# @param  {string}  pattern
#     PCRE2 expression to match against project files.
first_project_match() {
	local pattern="$1"  # PCRE2 expression being searched for.
	local matches  # Matching lines from ripgrep, trimmed to the first line before returning.

	if matches="$(rg --hidden --no-ignore --pcre2 -n -m 1 \
		-g '!**/.git/**' \
		-g '!node_modules/**' \
		-g '!**/.boilersuit/generators/**' \
		-g '!*.lock' \
		-g '!*.lock.*' \
		-g '!package-lock.json' \
		-g '!pnpm-lock.yaml' \
		-g '!yarn.lock' \
		-g '!npm-shrinkwrap.json' \
		"$pattern" "$project_path")"; then
		printf '%s\n' "${matches%%$'\n'*}"
		return 0
	else
		local search_status="$?"  # Exit status from ripgrep; 1 means nothing matched.
		if (( search_status == 1 )); then
			return 1
		fi

		return "$search_status"
	fi
}

# Confirms one generated file contains an expected literal value, failing the
# setup-values stage when it is missing.
#
# @param  {string}  relative_path
#     File to check, relative to the generated project root.
# @param  {string}  expected_value
#     Exact text the file must contain.
# @param  {string}  value_name
#     Setup value name to report if the check fails.
assert_rendered_value() {
	local relative_path="$1"  # Project-relative file expected to hold the value.
	local expected_value="$2"  # Literal text the file must contain post-generation.
	local value_name="$3"  # Name of the setup value under test.
	local file_path="$project_path/$relative_path"  # Absolute path built from the project root.

	if [[ -f "$file_path" ]] && rg --fixed-strings --quiet -- "$expected_value" "$file_path"; then
		return 0
	fi

	fail_stage 'setup-values' "$relative_path:1: missing $value_name value"
	return 1
}

# Fails the unresolved-tokens stage if any {{ TOKEN }}-style marker remains in
# the generated project.
check_unresolved_tokens() {
	local token_match  # First leftover token marker found, if any.

	if token_match="$(first_project_match '\{\{[[:space:]]*[A-Z][A-Z0-9_]*(?:[[:space:]]*\\|[^}]*)?[[:space:]]*\}\}')"; then
		fail_stage 'unresolved-tokens' "$token_match"
		return 1
	else
		local search_status="$?"  # Exit status from the search; 1 means no marker was found.
		if (( search_status == 1 )); then
			return 0
		fi

		fail_stage 'unresolved-tokens' "$project_path:1: token scan failed"
		return 1
	fi
}

# Fails the setup-values stage if any matrix input did not land in its
# expected generated file.
check_setup_values() {
	local project_name  # PROJECT_NAME value for this mode, taken from the project directory name.
	project_name="$(basename "$project_path")"

	if ! node -e 'const packageJson = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")); process.exit(Number(packageJson.name !== process.argv[2]));' "$project_path/package.json" "$project_name"; then
		fail_stage 'setup-values' "package.json:1: missing PROJECT_NAME value"
		return 1
	fi

	assert_rendered_value 'README.md' "# $project_name" 'PROJECT_NAME' || return 1
	assert_rendered_value 'vite.config.js' "base: \"$base_url\"" 'BASE_URL' || return 1
	assert_rendered_value 'index.html' "<title>$site_title</title>" 'SITE_TITLE' || return 1
	assert_rendered_value 'index.html' "content=\"$site_description\"" 'SITE_DESCRIPTION' || return 1
	assert_rendered_value 'index.html' "property=\"og:site_name\" content=\"$site_title\"" 'SITE_TITLE' || return 1
	assert_rendered_value 'index.html' "property=\"og:title\" content=\"$site_title\"" 'SITE_TITLE' || return 1
	assert_rendered_value 'index.html' "property=\"og:description\" content=\"$site_description\"" 'SITE_DESCRIPTION' || return 1
	assert_rendered_value 'public/manifest.json' "\"name\": \"$site_title\"" 'SITE_TITLE' || return 1
	assert_rendered_value 'index.html' "rel=\"canonical\" href=\"$site_url\"" 'SITE_URL' || return 1
	assert_rendered_value 'index.html' "property=\"og:url\" content=\"$site_url\"" 'SITE_URL' || return 1
	assert_rendered_value 'index.html' "name=\"theme-color\" content=\"$theme_colour\"" 'THEME_COLOUR' || return 1
}

# Reports whether a host is on the allowed list of reserved, example, or
# local-development hosts safe to appear in generated output.
#
# @param  {string}  host
#     Host name to check against the allowlist.
is_safe_host() {
	local host="$1"  # Host being checked against the allowlist.

	case "$host" in
		example.com|*.example.com|example.org|*.example.org|example.net|*.example.net|*.example|*.invalid|localhost|*.localhost|127.0.0.1|0.0.0.0|::1)
			return 0
			;;
		*)
			return 1
			;;
	esac
}

# Strips scheme, credentials, port, and path from an absolute HTTP(S) URL,
# leaving only the host.
#
# @param  {string}  url
#     Absolute HTTP(S) URL to extract the host from.
url_host() {
	local url="$1"  # Absolute URL to parse.
	local authority="${url#*://}"  # Everything after the scheme: authority plus path.

	authority="${authority%%/*}"
	authority="${authority##*@}"
	authority="${authority%%:*}"
	printf '%s\n' "$authority"
}

# Fails the content-safety stage if generated files contain a
# non-allowlisted URL or a credential-shaped string.
check_content_safety() {
	local url_match  # Single URL line being checked in the loop below.
	local url_matches  # Every absolute URL found across the generated project.
	local credential_match  # First credential-shaped string found, if any.
	local match_remainder  # Ripgrep match with the leading file path stripped.
	local url  # URL extracted from the current match.
	local host  # Host parsed from that URL.

	if url_matches="$(rg --hidden --no-ignore --pcre2 -n -o \
		-g '!**/.git/**' \
		-g '!node_modules/**' \
		-g '!*.lock' \
		-g '!*.lock.*' \
		-g '!package-lock.json' \
		-g '!pnpm-lock.yaml' \
		-g '!yarn.lock' \
		-g '!npm-shrinkwrap.json' \
		'https?://[^[:space:]"<>`]+' "$project_path")"; then
		while IFS= read -r url_match; do
			match_remainder="${url_match#*:}"
			url="${match_remainder#*:}"
			host="$(url_host "$url")"

			if ! is_safe_host "$host"; then
				fail_stage 'content-safety' "$url_match"
				return 1
			fi
		done <<< "$url_matches"
	else
		local url_search_status="$?"  # Exit status from the URL search; 1 means none was found.
		if (( url_search_status != 1 )); then
			fail_stage 'content-safety' "$project_path:1: URL scan failed"
			return 1
		fi
	fi

	if credential_match="$(first_project_match '(?i)\bBearer[[:space:]]+[A-Za-z0-9._~+/-]{16,}\b|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b|\b(?:api[_-]?key|access[_-]?token|secret(?:[_-]?key)?)\b\s*[:=]\s*(?:["\x27])[A-Za-z0-9_./+=-]{16,}(?:["\x27])')"; then
		fail_stage 'content-safety' "$credential_match"
		return 1
	else
		local search_status="$?"  # Exit status from the credential search; 1 means nothing matched.
		if (( search_status == 1 )); then
			return 0
		fi

		fail_stage 'content-safety' "$project_path:1: credential scan failed"
		return 1
	fi
}

run_stage 'unresolved-tokens' check_unresolved_tokens
run_stage 'setup-values' check_setup_values
run_stage 'content-safety' check_content_safety

if (( failed_stages > 0 )); then
	exit 1
fi
