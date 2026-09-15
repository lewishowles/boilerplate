import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed } from "vue";
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
 * @returns  {object}
 *     Query state and the current {{ NAME | kebab }} items.
 */
export function use{{ NAME | pascal }}() {
	// Query state for the current list.
	const current{{ NAME | pascal }} = useQueryWrapper({
		queryOptions: {{ NAME | camel }}QueryOptions,
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

	// Whether any {{ NAME | kebab }} items have been returned.
	const have{{ NAME | pascal }} = computed(() => isNonEmptyArray({{ NAME | camel }}.value));

	return {
		...current{{ NAME | pascal }},
		have{{ NAME | pascal }},
		{{ NAME | camel }},
	};
}

/**
 * Load the {{ NAME | kebab }} list.
 *
 * @returns  {Promise<object>}
 *     The formatted {{ NAME | kebab }} list response.
 */
async function load{{ NAME | pascal }}() {
	// API response for the list.
	const response = await get("{{ ENDPOINT }}");

	return {
		...response,
		items: (response?.items ?? []).map(format{{ SINGULAR_NAME | pascal }}),
	};
}

// Query options for the {{ NAME | kebab }} list.
const {{ NAME | camel }}QueryOptions = defineQueryOptions({
	key: {{ NAME | constant }}_KEYS.list(),
	query: load{{ NAME | pascal }},
});
