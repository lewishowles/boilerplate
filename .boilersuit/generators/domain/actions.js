import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { toValue } from "vue";
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API methods used to create and update {{ SINGULAR_NAME | kebab }} records.
const { patch, post } = {{ API_COMPOSABLE }}();

/**
 * Create and update {{ SINGULAR_NAME | kebab }} records.
 *
 * @returns  {object}
 *     The create and update actions.
 */
export function use{{ SINGULAR_NAME | pascal }}Actions() {
	// Action that creates a {{ SINGULAR_NAME | kebab }} record.
	const { mutateAsync: create{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		invalidates: [{{ NAME | constant }}_KEYS.root],
		/**
		 * Create a {{ SINGULAR_NAME | kebab }} record through the API.
		 *
		 * @param  {object}  parameters
		 *     The values to send to the API.
		 *
		 * @returns  {Promise<object>}
		 *     The created {{ SINGULAR_NAME | kebab }} record.
		 */
		mutation: (parameters) => post("{{ ENDPOINT }}", normaliseParametersForApi(parameters)),
	});

	// Action that updates a {{ SINGULAR_NAME | kebab }} record.
	const { mutateAsync: update{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		/**
		 * Return cache keys affected by an updated record.
		 *
		 * @param  {object}  variables
		 *     The values passed to the update action.
		 *
		 * @returns  {object[][]}
		 *     The query keys that need refreshing.
		 */
		invalidates: (variables) => [{{ NAME | constant }}_KEYS.root, {{ NAME | constant }}_KEYS.byId(variables.{{ ID_NAME }})],
		/**
		 * Update a {{ SINGULAR_NAME | kebab }} record through the API.
		 *
		 * @param  {object}  options
		 *     The record ID and values to send to the API.
		 * @param  {string}  options.{{ ID_NAME }}
		 *     The ID of the {{ SINGULAR_NAME | kebab }} to update.
		 *
		 * @returns  {Promise<object>}
		 *     The updated {{ SINGULAR_NAME | kebab }} record.
		 */
		mutation: ({ {{ ID_NAME }}, ...parameters }) =>
			patch(`{{ ENDPOINT }}/${{{ ID_NAME }}}`, normaliseParametersForApi(parameters)),
	});

	return {
		create{{ SINGULAR_NAME | pascal }},
		update{{ SINGULAR_NAME | pascal }},
	};
}

/**
 * Prepare form values for the API.
 *
 * Add field mapping here when the API shape differs from the form shape.
 *
 * @param  {object}  parameters
 *     The values to send to the API.
 *
 * @returns  {object}
 *     The values to send unchanged until domain-specific mapping is added.
 */
function normaliseParametersForApi(parameters) {
	return toValue(parameters);
}
