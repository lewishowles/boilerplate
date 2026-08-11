import { computed } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import useApi from "@/composables/api";

import { shapeExampleResponse } from "./helpers.js";
import { EXAMPLE_KEYS } from "./keys.js";

const { get } = useApi();

// The key that defines the example list.
export const EXAMPLE_QUERY_KEY = EXAMPLE_KEYS.list();

/**
 * Provide access to the example list.
 */
export function useExample() {
	const currentExample = useQueryWrapper({
		queryOptions: exampleQueryOptions,
	});

	// The returned response.
	const data = currentExample.data;

	// The returned example items.
	const example = computed(() => {
		const items = getPropertyValue(data.value, "items");

		if (!isNonEmptyArray(items)) {
			return [];
		}

		return items;
	});

	// Whether any example items have been returned.
	const haveExample = computed(() => isNonEmptyArray(example.value));

	return {
		...currentExample,
		haveExample,
		example,
	};
}

/**
 * Load the example list.
 */
async function loadExample() {
	return shapeExampleResponse(await get("examples"));
}

const exampleQueryOptions = defineQueryOptions({
	key: EXAMPLE_QUERY_KEY,
	query: loadExample,
});
