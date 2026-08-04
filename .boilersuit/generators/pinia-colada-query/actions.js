{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

import { {{ QUERY_KEY }}_KEYS } from "./keys.js";

const { patch, post } = {{ API_COMPOSABLE }}();

/**
 * Provide create and update actions for {{ NAME | kebab }}.
 */
export function use{{ COMPOSABLE_NAME }}Actions() {
	const { mutateAsync: create{{ COMPOSABLE_NAME }} } = useMutationWrapper({
		invalidates: [{{ QUERY_KEY }}_KEYS.root, {{ QUERY_KEY }}_KEYS.list()],
		mutation: (parameters) => post("{{ ENDPOINT }}", parameters),
	});

	const { mutateAsync: update{{ COMPOSABLE_NAME }} } = useMutationWrapper({
		invalidates: (variables) => [
			{{ QUERY_KEY }}_KEYS.root,
			{{ QUERY_KEY }}_KEYS.list(),
			{{ QUERY_KEY }}_KEYS.byId(variables.{{ ID_NAME }}),
		],
		mutation: ({ {{ ID_NAME }}, ...parameters }) =>
			patch(`{{ ENDPOINT }}/${{{ ID_NAME }}}`, parameters),
	});

	return {
		create{{ COMPOSABLE_NAME }},
		update{{ COMPOSABLE_NAME }},
	};
}

// Add delete or project-specific actions here when their API contract is known.
