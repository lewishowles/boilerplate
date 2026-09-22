// Group the collection's query cache entries by operation and parameters.
export const {{ NAME | constant }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	/**
	 * Build the cache key for a parameterised {{ NAME | kebab }} list.
	 *
	 * @param  {object}  [parameters]
	 *     The list parameters to include in the key.
	 *
	 * @returns  {object[]}
	 *     The cache key for the parameterised list.
	 */
	list: (parameters = {}) => ["{{ NAME | kebab }}", "list", parameters],
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
