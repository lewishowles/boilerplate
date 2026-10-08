import { isObject } from "@lewishowles/helpers/object";

/**
 * Format API responses for {{ NAME | kebab }} queries.
 *
 * Add field mapping here when the API response differs from the query data.
 *
 * @param  {object}  response
 *     The {{ SINGULAR_NAME }} returned by the API.
 * @returns  {object}
 *     Formatted {{ SINGULAR_NAME }}.
 */
export function format{{ SINGULAR_NAME | pascal }}({{ SINGULAR_NAME | camel }}) {
	if (!isObject({{ SINGULAR_NAME | camel }})) {
		return {{ SINGULAR_NAME | camel }};
	}

	// The values the app works out from the API fields.
	const derived = {};

	return { ...{{ SINGULAR_NAME | camel }}, derived };
}
