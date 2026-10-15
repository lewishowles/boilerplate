import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { defineQueryOptions } from "@pinia/colada";
import { {{ NAME | camel }}Domain } from "./definition.js";
import { mock{{ NAME | pascal }} } from "./mock.js";
import { computed, unref } from "vue";

// The API client, endpoint, formatter, and cache keys for {{ NAME | words }} requests.
const { api, endpoint, format, keys } = {{ NAME | camel }}Domain;
// Whether {{ NAME | words }} requests return fixture data in development.
const isMockData = import.meta.env.VITE_MOCK_DATA === "true";

/**
 * Provide access to the {{ NAME | words }} list.
 *
 * @param  {object}  [parameters]
 *     Query parameters for the {{ NAME | words }} list.
 *
 * @returns  {object}
 *     The {{ NAME | words }} query state and actions.
 */
export function use{{ NAME | pascal }}(parameters = {}) {
	// Current query state and actions for the {{ NAME | words }} list.
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

	// The returned {{ NAME | words }} items.
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
	// Whether any {{ NAME | words }} items have been returned.
	const have{{ NAME | pascal }} = computed(() => isNonEmptyArray({{ NAME | camel }}.value));

	return {
		...current{{ NAME | pascal }},
		have{{ NAME | pascal }},
		{{ NAME | camel }},
		totalRows,
	};
}

/**
 * Load the {{ NAME | words }} list, returning fixture data in mock mode after the API
 * request is sent.
 *
 * @param  {object}  parameters
 *     Query parameters for the {{ NAME | words }} list.
 *
 * @throws  {Error}
 *     The API error when mock data is disabled.
 *
 * @returns  {Promise<object>}
 *     The {{ NAME | words }} list response with each {{ SINGULAR_NAME | words }} formatted.
 */
async function load{{ NAME | pascal }}(parameters) {
	// API response used to build the list data.
	let response;

	try {
		response = await api.get(endpoint, parameters);
	} catch (error) {
		if (!isMockData) {
			throw error;
		}
	}

	// The fixture data in mock mode, otherwise the API response.
	const listResponse = isMockData ? mock{{ NAME | pascal }} : response;
	// The items from that response, before formatting.
	const items = getPropertyValue(listResponse, "items");

	return {
		...listResponse,
		items: isNonEmptyArray(items) ? items.map((item) => format(item)) : [],
	};
}

// Describe how the parameterised list cache is keyed and loaded.
const {{ NAME | camel }}QueryOptions = defineQueryOptions((parameters = {}) => ({
	key: keys.list(parameters),
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
