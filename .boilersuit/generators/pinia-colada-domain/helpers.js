/**
 * Format API responses for {{ NAME | kebab }} queries.
 *
 * Add field mapping here when the API response differs from the query data.
 *
 * @param  {unknown}  response
 *     The raw API response.
 * @returns  {unknown}
 *     Formatted response data.
 */
export function format{{ NAME | pascal }}Response(response) {
	if (response === null || typeof response !== "object") {
		return response;
	}

	const payload = response.data ?? response;

	return {
		...payload,
		itemsTotal: response.itemsTotal ?? payload.itemsTotal,
	};
}
