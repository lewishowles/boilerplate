/**
 * Shape a raw example API response before query consumers receive it.
 *
 * This is the neutral extension point for backend field renaming, coercion, or
 * response-envelope handling.
 *
 * @param  {unknown}  response
 *     The raw API response.
 * @returns  {unknown}
 *     The shaped query response.
 */
export function shapeExampleResponse(response) {
	if (response === null || typeof response !== "object") {
		return response;
	}

	const payload = response.data ?? response;

	return {
		...payload,
	};
}
