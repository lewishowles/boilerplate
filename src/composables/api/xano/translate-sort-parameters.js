// The sort direction values Xano accepts, keyed by the direction our data
// tables report.
const sortDirections = {
	ascending: "asc",
	descending: "desc",
};

/**
 * Convert the `sort` object our tables produce into the separate `sort_by` and
 * `sort_order` query parameters that Xano list endpoints expect. A sort we
 * don't translate is ignored by Xano, which quietly returns its own default
 * order instead.
 *
 * A sort we can't translate is left in place rather than removed, so the bad
 * value stays visible in the request. The results come back in Xano's default
 * order either way.
 *
 * @param  {object}  parameters
 *     The query parameters for a request, optionally including a `sort` object
 *     with `column` and `direction`.
 *
 * @returns  {object}
 *     The updated parameters.
 */
export default function translateSortParameters(parameters = {}) {
	// Split sort from other parameters, to rejoin later.
	const { sort, ...otherParameters } = parameters;
	// Determine which sort order we're requesting.
	const sortOrder = sortDirections[sort?.direction];

	if (!sort?.column || !sortOrder) {
		return { ...parameters };
	}

	return {
		...otherParameters,
		sort_by: sort.column,
		sort_order: sortOrder,
	};
}
