{{ set COMPOSABLE_NAME = NAME | pascal }}
/**
 * Shape a raw {{ NAME | kebab }} API response before query consumers receive it.
 *
 * This is the neutral extension point for backend field renaming, coercion, or
 * response-envelope handling.
 *
 * @param  {unknown}  response
 *     The raw API response.
 * @returns  {unknown}
 *     The shaped query response.
 */
export function shape{{ COMPOSABLE_NAME }}Response(response) {
	if (response === null || typeof response !== "object") {
		return response;
	}

	const payload = response.data ?? response;

	return {
		...payload,
	};
}
