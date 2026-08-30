# Shared assertion helpers for the verify-generated-projects check modules.
# Sourced by every check-*.sh; not executable on its own. Each assert_* helper
# returns 0 when its expectation holds. The dependency check distinguishes a
# declared dependency (0), an absent dependency (1), and a missing package.json (2).
#
# The assert_* helpers are only safe under `set -e` when called in a conditional
# context (if, &&, ||, or negated). A bare call that returns non-zero aborts the
# calling module.

# Prints one result line as "PASS <group>" or "FAIL <group>".
#
# @param  {string}  result
#     Result token, PASS or FAIL.
# @param  {string}  group_name
#     Human-readable name of the assertion group.
report_result() {
	local result="$1"  # Result token, PASS or FAIL.
	local group_name="$2"  # Name of the assertion group being reported.

	printf '%s %s\n' "$result" "$group_name"
}

# Succeeds when a file exists at the given path inside the project.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  relative_path
#     File path relative to the project root.
assert_file_present() {
	local project_path="$1"  # Generated project root.
	local relative_path="$2"  # File to look for, relative to the root.

	[[ -f "$project_path/$relative_path" ]]
}

# Succeeds when nothing exists at the given path inside the project.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  relative_path
#     Path relative to the project root that must not exist.
assert_file_absent() {
	local project_path="$1"  # Generated project root.
	local relative_path="$2"  # Path that must not exist, relative to the root.

	[[ ! -e "$project_path/$relative_path" ]]
}

# Checks whether the named package appears in any dependency field of the
# project's package.json. Returns 0 when declared, 1 when absent, and 2 when
# package.json is missing.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  dependency_name
#     Package name to look for.
dependency_is_declared() {
	local project_path="$1"  # Generated project root.
	local dependency_name="$2"  # Package name to look for.
	local package_json_path="$project_path/package.json"  # Manifest to inspect.

	[[ -f "$package_json_path" ]] || return 2

	# This script checks every dependency field in the manifest.
	local dependency_check_script='
const packagePath = process.argv[1];
const dependencyName = process.argv[2];
const packageJson = require(packagePath);
const dependencyFields = {
	dependencies: packageJson.dependencies,
	devDependencies: packageJson.devDependencies,
	optionalDependencies: packageJson.optionalDependencies,
	peerDependencies: packageJson.peerDependencies,
};
const isDeclared = Object.values(dependencyFields).some(
	(dependencies) => dependencies?.[dependencyName],
);
process.exit(Number(!isDeclared));
'

	node -e "$dependency_check_script" "$package_json_path" "$dependency_name"
}

# Succeeds when the named package appears in any dependency field of the
# project's package.json. Returns 2 when package.json is missing.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  dependency_name
#     Package name to look for.
assert_dependency_present() {
	local project_path="$1"  # Generated project root.
	local dependency_name="$2"  # Package name to look for.

	dependency_is_declared "$project_path" "$dependency_name"
}

# Succeeds when the named package appears in no dependency field of the
# project's package.json. Returns 2 when package.json is missing.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  dependency_name
#     Package name that must be absent.
assert_dependency_absent() {
	local project_path="$1"  # Generated project root.
	local dependency_name="$2"  # Package name that must be absent.
	local dependency_status=0  # 0 declared, 1 absent, or 2 when package.json is missing.

	dependency_is_declared "$project_path" "$dependency_name" || dependency_status=$?

	(( dependency_status == 0 )) && return 1
	(( dependency_status == 1 )) && return 0

	return "$dependency_status"
}

# Succeeds when no file under the project matches the given glob. Ignore rules are
# not applied, so generated files that the project would gitignore still count.
# A missing project directory, or a ripgrep failure other than "no match" (such
# as a malformed glob), fails the assertion instead of passing as a clean
# no-match.
#
# @param  {string}  project_path
#     Root of the generated project.
# @param  {string}  file_pattern
#     ripgrep glob to test against the project's files.
assert_no_match() {
	local project_path="$1"  # Generated project root.
	local file_pattern="$2"  # ripgrep glob to test against the project's files.
	local matches  # Newline-separated list of matching files, empty when none.

	if matches="$(cd "$project_path" || exit 3; rg --no-ignore --files -g "$file_pattern" .)"; then
		[[ -z "$matches" ]]
		return
	else
		local match_status="$?"  # Subshell status: 1 is ripgrep's no-match; 3 (missing directory) or anything else is an error.

		if (( match_status == 1 )); then
			return 0
		fi

		return "$match_status"
	fi
}
