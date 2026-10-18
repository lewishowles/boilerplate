import { isObject } from "@lewishowles/helpers/object";

/**
 * Format one {{ SINGULAR_NAME | words }} from the API for the app to use.
 *
 * Add field mapping here when the API fields differ from what the app needs.
 *
 * @param  {object}  {{ SINGULAR_NAME | camel }}
 *     The {{ SINGULAR_NAME | words }} returned by the API.
 *
 * @returns  {object}
 *     A copy with a `derived` object added, or the value unchanged when it is
 *     not an object.
 */
export function format{{ SINGULAR_NAME | pascal }}({{ SINGULAR_NAME | camel }}) {
	if (!isObject({{ SINGULAR_NAME | camel }})) {
		return {{ SINGULAR_NAME | camel }};
	}

	// The values the app works out from the API fields.
	const derived = {};

	return { ...{{ SINGULAR_NAME | camel }}, derived };
}
