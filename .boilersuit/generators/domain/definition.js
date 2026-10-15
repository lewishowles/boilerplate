import { format{{ SINGULAR_NAME | pascal }} } from "./helpers.js";
import { {{ NAME | constant }}_KEYS } from "./keys.js";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// The API settings that every {{ NAME | words }} query and action reads, so each one is declared once.
export const {{ NAME | camel }}Domain = {
	// The API client for {{ NAME | words }} requests.
	api: {{ API_COMPOSABLE }}(),
	// The path that standard {{ NAME | words }} requests start from.
	endpoint: "{{ ENDPOINT }}",
	// The cache keys for {{ NAME | words }} queries.
	keys: {{ NAME | constant }}_KEYS,
	// Shapes one API record for the app; edit it in helpers.js.
	format: format{{ SINGULAR_NAME | pascal }},
};
