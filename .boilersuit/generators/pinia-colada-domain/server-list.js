import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ NAME | pascal }}Response } from "./helpers.js";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { get } = {{ API_COMPOSABLE }}();

/**
 * Provide access to the {{ NAME | kebab }} list.
 *
 * @param  {object}  [parameters]
 *     Query parameters for the {{ NAME | kebab }} list.
 */
export function use{{ NAME | pascal }}(parameters = {}) {
	const current{{ NAME | pascal }} = useQueryWrapper({
		queryOptions: () => {{ NAME | camel }}QueryOptions(unref(parameters)),
	});

	// The returned response.
	const data = current{{ NAME | pascal }}.data;

	// The returned {{ NAME | kebab }} items.
	const {{ NAME | camel }} = computed(() => {
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
 */
async function load{{ NAME | pascal }}(parameters) {
	const queryParameters = {
		...parameters,
		sort: parameters.sort
			? {
					column: parameters.sort.column,
					direction: parameters.sort.direction,
				}
			: null,
	};

	const response = await get("{{ ENDPOINT }}", queryParameters);

	return format{{ NAME | pascal }}Response(response);
}

const {{ NAME | camel }}QueryOptions = defineQueryOptions((parameters = {}) => ({
	key: {{ NAME | constant }}_KEYS.list(parameters),
	query: () => load{{ NAME | pascal }}(parameters),
	placeholderData: (previousData) => previousData,
}));
