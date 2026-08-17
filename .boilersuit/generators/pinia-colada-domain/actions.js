import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { patch, post } = {{ API_COMPOSABLE }}();

/**
 * Create and update {{ SINGULAR_NAME | kebab }} records.
 */
export function use{{ SINGULAR_NAME | pascal }}Actions() {
	const { mutateAsync: create{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		invalidates: [{{ NAME | constant }}_KEYS.root, {{ NAME | constant }}_KEYS.list()],
		mutation: (parameters) => post("{{ ENDPOINT }}", parameters),
	});

	const { mutateAsync: update{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		invalidates: (variables) => [
			{{ NAME | constant }}_KEYS.root,
			{{ NAME | constant }}_KEYS.list(),
			{{ NAME | constant }}_KEYS.byId(variables.{{ ID_NAME }}),
		],
		mutation: ({ {{ ID_NAME }}, ...parameters }) => patch(`{{ ENDPOINT }}/${{{ ID_NAME }}}`, parameters),
	});

	return {
		create{{ SINGULAR_NAME | pascal }},
		update{{ SINGULAR_NAME | pascal }},
	};
}

// TODO: Add delete
