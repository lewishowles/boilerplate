{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { get } = {{ API_COMPOSABLE }}();

// The key that defines {{ NAME | kebab }} details.
export const {{ QUERY_KEY }}_QUERY_KEY = ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}];

/**
 * Provide access to {{ NAME | kebab }} details.
 *
 * @param  {string|object}  {{ ID_NAME }}
 *     The {{ NAME | kebab }} ID.
 */
export function use{{ COMPOSABLE_NAME }}({{ ID_NAME }}) {
	const internalId = unref({{ ID_NAME }});

	const current{{ COMPOSABLE_NAME }} = useQueryWrapper({
		queryOptions: () => ({
			...{{ DATA_NAME }}QueryOptions(internalId),
			enabled: Boolean(internalId),
		}),
		isReady: (data) => isNonEmptyObject(data),
	});

	// The returned {{ NAME | kebab }} details.
	const {{ DATA_NAME }} = current{{ COMPOSABLE_NAME }}.data;
	// Whether {{ NAME | kebab }} details are present.
	const have{{ COMPOSABLE_NAME }} = computed(() => isNonEmptyObject({{ DATA_NAME }}.value));

	return {
		...current{{ COMPOSABLE_NAME }},
		have{{ COMPOSABLE_NAME }},
		{{ DATA_NAME }},
	};
}

/**
 * Load {{ NAME | kebab }} details.
 *
 * @param  {string}  {{ ID_NAME }}
 *     The ID of the {{ NAME | kebab }} to load.
 */
async function get{{ COMPOSABLE_NAME }}({{ ID_NAME }}) {
	return await get(`{{ ENDPOINT }}/${{{ ID_NAME }}}`);
}

// Query options for {{ NAME | kebab }} details.
const {{ DATA_NAME }}QueryOptions = defineQueryOptions(({{ ID_NAME }}) => ({
	key: {{ QUERY_KEY }}_QUERY_KEY({{ ID_NAME }}),
	query: () => get{{ COMPOSABLE_NAME }}({{ ID_NAME }}),
}));
