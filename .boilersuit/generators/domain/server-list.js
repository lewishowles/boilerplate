import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { format{{ NAME | pascal }}Response } from "./helpers.js";
import { mock{{ NAME | pascal }} } from "./mock.js";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API method used to load {{ NAME | kebab }} records.
const { get } = {{ API_COMPOSABLE }}();
// Whether {{ NAME | kebab }} requests return fixture data in development.
const isMockData = import.meta.env.VITE_MOCK_DATA === "true";

/**
 * Provide access to the {{ NAME | kebab }} list.
 *
 * @param  {object}  [parameters]
 *     Query parameters for the {{ NAME | kebab }} list.
 *
 * @returns  {object}
 *     The {{ NAME | kebab }} query state and actions.
 */
export function use{{ NAME | pascal }}(parameters = {}) {
	// Current query state and actions for the {{ NAME | kebab }} list.
	const current{{ NAME | pascal }} = useQueryWrapper({
		/**
		 * Build the query options for the current list parameters.
		 *
		 * @returns  {object}
		 *     The query options for the current list.
		 */
		queryOptions: () => {{ NAME | camel }}QueryOptions(unref(parameters)),
	});

	// The raw response, which also carries the total row count.
	const data = current{{ NAME | pascal }}.data;

	// The returned {{ NAME | kebab }} items.
	const {{ NAME | camel }} = computed(() => {
		// Items returned by the API response.
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
 * Load the {{ NAME | kebab }} list, returning fixture data in mock mode after the API
 * request is sent.
 *
 * @param  {object}  parameters
 *     Query parameters for the {{ NAME | kebab }} list.
 *
 * @throws  {Error}
 *     The API error when mock data is disabled.
 *
 * @returns  {Promise<object>}
 *     The formatted {{ NAME | kebab }} list response.
 */
async function load{{ NAME | pascal }}(parameters) {
	// API response used to build the list data.
	let response;

	try {
		response = await get("{{ ENDPOINT }}", parameters);
	} catch (error) {
		if (!isMockData) {
			throw error;
		}
	}

	// Response data normalised to the query shape.
	const formattedResponse = format{{ NAME | pascal }}Response(isMockData ? mock{{ NAME | pascal }} : response);
	// Items to format in the list response.
	const items = getPropertyValue(formattedResponse, "items");

	return {
		...formattedResponse,
		items: isNonEmptyArray(items) ? items.map((item) => format{{ NAME | pascal }}Response(item)) : [],
	};
}

// Describe how the parameterised list cache is keyed and loaded.
const {{ NAME | camel }}QueryOptions = defineQueryOptions((parameters = {}) => ({
	key: {{ NAME | constant }}_KEYS.list(parameters),
	/**
	 * Load the list for the requested parameters.
	 *
	 * @returns  {Promise<object>}
	 *     The formatted list response.
	 */
	query: () => load{{ NAME | pascal }}(parameters),
	/**
	 * Keep the previous response visible while the next response loads.
	 *
	 * @param  {object}  previousData
	 *     The previous list response.
	 *
	 * @returns  {object}
	 *     The response to display while loading.
	 */
	placeholderData: (previousData) => previousData,
}));
