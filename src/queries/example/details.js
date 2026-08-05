import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import useApi from "@/composables/api/use-api";

import { shapeExampleResponse } from "./helpers.js";
import { EXAMPLE_KEYS } from "./keys.js";

const { get } = useApi();

// The key that defines example details.
export const EXAMPLE_QUERY_KEY = (id) => EXAMPLE_KEYS.byId(id);

/**
 * Provide access to example details.
 *
 * @param  {string|object}  id
 *     The example ID.
 */
export function useExample(id) {
	const currentExample = useQueryWrapper({
		queryOptions: () => ({
			...exampleQueryOptions(unref(id)),
			enabled: Boolean(unref(id)),
		}),
		isReady: (data) => isNonEmptyObject(data),
	});

	// The returned example details.
	const example = currentExample.data;
	// Whether example details are present.
	const haveExample = computed(() => isNonEmptyObject(example.value));

	return {
		...currentExample,
		haveExample,
		example,
	};
}

/**
 * Load example details.
 *
 * @param  {string}  id
 *     The ID of the example to load.
 */
async function getExample(id) {
	return shapeExampleResponse(await get(`examples/${id}`));
}

// Query options for example details.
const exampleQueryOptions = defineQueryOptions((id) => ({
	key: EXAMPLE_QUERY_KEY(id),
	query: () => getExample(id),
}));
