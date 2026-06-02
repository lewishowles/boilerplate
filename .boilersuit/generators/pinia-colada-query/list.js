{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { computed } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { get as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { get } = {{ API_COMPOSABLE }}();

// The key that defines the {{ NAME | kebab }} list.
export const {{ QUERY_KEY }}_QUERY_KEY = ["{{ NAME | kebab }}", "list"];

/**
 * Provide access to the {{ NAME | kebab }} list.
 */
export function use{{ COMPOSABLE_NAME }}() {
	const current{{ COMPOSABLE_NAME }} = useQueryWrapper({
		queryOptions: {{ DATA_NAME }}QueryOptions,
	});

	// The returned response.
	const data = current{{ COMPOSABLE_NAME }}.data;

	// The returned {{ NAME | kebab }} items.
	const {{ DATA_NAME }} = computed(() => {
		const items = getPropertyValue(data.value, "items");

		if (!isNonEmptyArray(items)) {
			return [];
		}

		return items;
	});

	// Whether any {{ NAME | kebab }} items have been returned.
	const have{{ COMPOSABLE_NAME }} = computed(() => isNonEmptyArray({{ DATA_NAME }}.value));

	return {
		...current{{ COMPOSABLE_NAME }},
		have{{ COMPOSABLE_NAME }},
		{{ DATA_NAME }},
	};
}

/**
 * Load the {{ NAME | kebab }} list.
 */
async function load{{ COMPOSABLE_NAME }}() {
	return await get("{{ ENDPOINT }}");
}

const {{ DATA_NAME }}QueryOptions = defineQueryOptions({
	key: {{ QUERY_KEY }}_QUERY_KEY,
	query: load{{ COMPOSABLE_NAME }},
});
