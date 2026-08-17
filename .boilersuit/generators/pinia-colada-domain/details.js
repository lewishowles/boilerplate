import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ NAME | pascal }}Response } from "./helpers.js";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

const { get } = {{ API_COMPOSABLE }}();

/**
 * Provide access to a {{ SINGULAR_NAME | kebab }} record.
 *
 * @param  {string|object}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | kebab }} ID.
 */
export function use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	const current{{ SINGULAR_NAME | pascal }} = useQueryWrapper({
		queryOptions: () => ({
			...{{ SINGULAR_NAME | camel }}QueryOptions(unref({{ ID_NAME }})),
			enabled: Boolean(unref({{ ID_NAME }})),
		}),
		isReady: (data) => isNonEmptyObject(data),
	});

	// The returned {{ SINGULAR_NAME | kebab }} record.
	const {{ SINGULAR_NAME | camel }} = current{{ SINGULAR_NAME | pascal }}.data;
	// Whether a {{ SINGULAR_NAME | kebab }} record is present.
	const have{{ SINGULAR_NAME | pascal }} = computed(() => isNonEmptyObject({{ SINGULAR_NAME | camel }}.value));

	return {
		...current{{ SINGULAR_NAME | pascal }},
		have{{ SINGULAR_NAME | pascal }},
		{{ SINGULAR_NAME | camel }},
	};
}

/**
 * Load a {{ SINGULAR_NAME | kebab }} record.
 *
 * @param  {string}  {{ ID_NAME }}
 *     The ID of the {{ SINGULAR_NAME | kebab }} to load.
 */
async function get{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	const response = await get(`{{ ENDPOINT }}/${{{ ID_NAME }}}`);

	return format{{ NAME | pascal }}Response(response);
}

// Query options for a {{ SINGULAR_NAME | kebab }} record.
const {{ SINGULAR_NAME | camel }}QueryOptions = defineQueryOptions(({{ ID_NAME }}) => ({
	key: {{ NAME | constant }}_KEYS.byId({{ ID_NAME }}),
	query: () => get{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}),
}));
