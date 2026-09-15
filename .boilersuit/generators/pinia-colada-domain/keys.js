// Query keys for the {{ NAME | kebab }} domain.
export const {{ NAME | constant }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	/**
	 * Build the key for the full {{ NAME | kebab }} list.
	 *
	 * @returns  {unknown[]}
	 *     The query key for the full list.
	 */
	list: () => ["{{ NAME | kebab }}", "list"],
	/**
	 * Build the key for one {{ SINGULAR_NAME | kebab }} record.
	 *
	 * @param  {string|number}  {{ ID_NAME }}
	 *     The record identifier.
	 *
	 * @returns  {unknown[]}
	 *     The query key for the record.
	 */
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
