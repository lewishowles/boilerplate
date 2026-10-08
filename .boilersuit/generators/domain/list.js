import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ SINGULAR_NAME | pascal }} } from "./helpers.js";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { mock{{ NAME | pascal }} } from "@/queries/mock/data.js";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { get } = {{ API_COMPOSABLE }}();
// Whether {{ NAME | words }} requests return fixture data in development.
const isMockData = import.meta.env.VITE_MOCK_DATA === "true";

/**
 * Provide access to the {{ NAME | words }} list.
 */
export function use{{ NAME | pascal }}() {
	const current{{ NAME | pascal }} = useQueryWrapper({
		queryOptions: {{ NAME | camel }}QueryOptions,
	});

	// The raw response, which also carries the total row count.
	const data = current{{ NAME | pascal }}.data;

	// The returned {{ NAME | words }} items.
	const {{ NAME | camel }} = computed(() => {
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
 * Load the {{ NAME | words }} list, returning fixture data in mock mode after the API request is sent.
 */
async function load{{ NAME | pascal }}() {
	let response;

	try {
		response = await get("{{ ENDPOINT }}");
	} catch (error) {
		if (!isMockData) {
			throw error;
		}
	}

	const listResponse = isMockData ? mock{{ NAME | pascal }} : response;
	const items = getPropertyValue(formattedResponse, "items");

	return {
		...listResponse,
		items: isNonEmptyArray(items) ? items.map((item) => format{{ SINGULAR_NAME | pascal }}(item)) : [],
	};
}

// Describe how the list cache is keyed and loaded.
const {{ NAME | camel }}QueryOptions = defineQueryOptions({
	key: {{ NAME | constant }}_KEYS.list(),
	query: load{{ NAME | pascal }},
});
