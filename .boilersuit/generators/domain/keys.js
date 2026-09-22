// Group the collection's query cache entries by operation.
export const {{ NAME | constant }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	/**
	 * Build the cache key for the {{ NAME | kebab }} list.
	 *
	 * @returns  {object[]}
	 *     The cache key for the list.
	 */
	list: () => ["{{ NAME | kebab }}", "list"],
	/**
	 * Build the cache key for a {{ SINGULAR_NAME | kebab }} record.
	 *
	 * @param  {string}  {{ ID_NAME }}
	 *     The record ID to include in the key.
	 *
	 * @returns  {object[]}
	 *     The cache key for the record.
	 */
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
