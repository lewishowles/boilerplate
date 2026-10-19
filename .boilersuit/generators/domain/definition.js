import { format{{ SINGULAR_NAME | pascal }} } from "./helpers.js";
import { {{ NAME | constant }}_KEYS } from "./keys.js";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// Shared API settings for {{ NAME | words }} queries and actions.
export const {{ NAME | camel }}Domain = {
	// The API client for {{ NAME | words }} requests.
	api: {{ API_COMPOSABLE }}(),
	// The path that standard {{ NAME | words }} requests start from.
	endpoint: "{{ ENDPOINT }}",
	// The field that holds a {{ SINGULAR_NAME | words }} record's ID.
	idName: "{{ ID_NAME }}",
	// The cache keys for {{ NAME | words }} queries.
	keys: {{ NAME | constant }}_KEYS,
	// Shapes one API record for the app; edit it in helpers.js.
	format: format{{ SINGULAR_NAME | pascal }},
	/**
	 * Map form values to the fields the API expects. Values pass through
	 * unchanged, so add mapping here when the form and API fields differ.
	 *
	 * @param  {object}  parameters
	 *     The submitted form values.
	 *
	 * @returns  {object}
	 *     The fields to send to the API.
	 */
	prepare: (parameters) => parameters,
};
