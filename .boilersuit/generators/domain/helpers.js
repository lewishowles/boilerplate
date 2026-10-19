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

/**
 * Format submitted {{ SINGULAR_NAME | words }} values for the API.
 *
 * Values pass through unchanged. Add field mapping here when the form and API
 * fields differ. Update bodies arrive without the ID and may contain only
 * changed fields.
 *
 * The values are a shallow copy, so top-level fields can be added, renamed or
 * removed freely. Replace nested objects and arrays rather than editing them,
 * because the form still shares those.
 *
 * @param  {object}  parameters
 *     The submitted form values.
 *
 * @returns  {object}
 *     The fields to send to the API.
 */
export function format{{ SINGULAR_NAME | pascal }}ForApi(parameters) {
	return parameters;
}
