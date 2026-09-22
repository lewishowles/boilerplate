/**
 * Format API responses for {{ NAME | kebab }} queries.
 *
 * Add field mapping here when the API response differs from the query data.
 *
 * @param  {unknown}  response
 *     The raw API response.
 *
 * @returns  {unknown}
 *     Formatted response data.
 */
export function format{{ NAME | pascal }}Response(response) {
	if (response === null || typeof response !== "object") {
		return response;
	}

	// Response data without an optional data envelope.
	const payload = response.data ?? response;
	// Copy of the response data that can carry normalised metadata.
	const formattedResponse = { ...payload };

	if (response.itemsTotal !== undefined || payload.itemsTotal !== undefined) {
		formattedResponse.itemsTotal = response.itemsTotal ?? payload.itemsTotal;
	}

	return formattedResponse;
}
