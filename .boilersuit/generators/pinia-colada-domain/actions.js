import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API methods used to create and update records.
const { patch, post } = {{ API_COMPOSABLE }}();

/**
 * Create and update {{ SINGULAR_NAME | kebab }} records.
 *
 * @returns  {object}
 *     Mutation functions for creating and updating records.
 */
export function use{{ SINGULAR_NAME | pascal }}Actions() {
	// Creates a record, then refreshes every {{ NAME | kebab }} query.
	const { mutateAsync: create{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		invalidates: [{{ NAME | constant }}_KEYS.root, {{ NAME | constant }}_KEYS.list()],
		/**
		 * Send the create request.
		 *
		 * @param  {object}  parameters
		 *     The record fields to send.
		 *
		 * @returns  {Promise<object>}
		 *     The created record response.
		 */
		mutation: (parameters) => post("{{ ENDPOINT }}", parameters),
	});

	// Updates a record, then refreshes every {{ NAME | kebab }} query.
	const { mutateAsync: update{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		/**
		 * List the query keys to refresh after an update.
		 *
		 * @param  {object}  variables
		 *     The record ID and fields being updated.
		 *
		 * @returns  {unknown[][]}
		 *     The query keys affected by the update.
		 */
		invalidates: (variables) => [
			{{ NAME | constant }}_KEYS.root,
			{{ NAME | constant }}_KEYS.list(),
			{{ NAME | constant }}_KEYS.byId(variables.{{ ID_NAME }}),
		],
		/**
		 * Send the update request.
		 *
		 * @param  {object}  options
		 *     The record ID and fields being updated.
		 * @param  {string|number}  options.{{ ID_NAME }}
		 *     The record identifier.
		 *
		 * @returns  {Promise<object>}
		 *     The updated record response.
		 */
		mutation: ({ {{ ID_NAME }}, ...parameters }) => patch(`{{ ENDPOINT }}/${{{ ID_NAME }}}`, parameters),
	});

	return {
		create{{ SINGULAR_NAME | pascal }},
		update{{ SINGULAR_NAME | pascal }},
	};
}

// TODO: Add delete.
