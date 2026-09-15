import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ SINGULAR_NAME | pascal }} } from "./helpers.js";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API method used to load the list.
const { get } = {{ API_COMPOSABLE }}();

/**
 * Provide access to the {{ NAME | kebab }} list.
 *
 * @param  {object}  [parameters]
 *     Query parameters for the {{ NAME | kebab }} list.
 *
 * @returns  {object}
 *     Query state and the current {{ NAME | kebab }} items.
 */
export function use{{ NAME | pascal }}(parameters = {}) {
	// Query state for the current list.
	const current{{ NAME | pascal }} = useQueryWrapper({
		/**
		 * Build query options for the current list parameters.
		 *
		 * @returns  {object}
		 *     Query options for the current list.
		 */
		queryOptions: () => {{ NAME | camel }}QueryOptions(unref(parameters)),
	});

	// The returned response.
	const data = current{{ NAME | pascal }}.data;

	// The returned {{ NAME | kebab }} items.
	const {{ NAME | camel }} = computed(() => {
		// Items read from the query response.
		const items = getPropertyValue(data.value, "items");

		if (!isNonEmptyArray(items)) {
			return [];
		}

		return items;
	});

	// The total rows returned by the server for the current request.
	const totalRows = computed(() => getPropertyValue(data.value, "itemsTotal") ?? 0);

	// Whether any {{ NAME | kebab }} items have been returned.
	const have{{ NAME | pascal }} = computed(() => isNonEmptyArray({{ NAME | camel }}.value));

	return {
		...current{{ NAME | pascal }},
		have{{ NAME | pascal }},
		{{ NAME | camel }},
		totalRows,
	};
}

/**
 * Load the {{ NAME | kebab }} list.
 *
 * @param  {object}  parameters
 *     Query parameters for the {{ NAME | kebab }} list.
 *
 * @returns  {Promise<object>}
 *     The formatted {{ NAME | kebab }} list response.
 */
async function load{{ NAME | pascal }}(parameters) {
	// Query parameters passed to the API.
	const queryParameters = {
		...parameters,
		sort: parameters.sort
			? {
					column: parameters.sort.column,
					direction: parameters.sort.direction,
				}
			: null,
	};

	// API response for the list.
	const response = await get("{{ ENDPOINT }}", queryParameters);

	return {
		...response,
		items: (response?.items ?? []).map(format{{ SINGULAR_NAME | pascal }}),
	};
}

// Query options for the {{ NAME | kebab }} list.
const {{ NAME | camel }}QueryOptions = defineQueryOptions((parameters = {}) => ({
	key: {{ NAME | constant }}_KEYS.list(parameters),
	/**
	 * Load the current {{ NAME | kebab }} list.
	 *
	 * @returns  {Promise<object>}
	 *     The formatted {{ NAME | kebab }} list response.
	 */
	query: () => load{{ NAME | pascal }}(parameters),
	/**
	 * Reuse the previous list while the next request is pending.
	 *
	 * @param  {object|null}  previousData
	 *     The previous list response.
	 *
	 * @returns  {object|null}
	 *     The data to show while the request is pending.
	 */
	placeholderData: (previousData) => previousData,
}));
