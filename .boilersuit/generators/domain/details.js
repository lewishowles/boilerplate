import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ NAME | pascal }}Response } from "./helpers.js";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API method used to load a {{ SINGULAR_NAME | kebab }} record.
const { get } = {{ API_COMPOSABLE }}();

/**
 * Provide access to a {{ SINGULAR_NAME | kebab }} record.
 *
 * @param  {string|Ref<string>}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | kebab }} ID.
 *
 * @returns  {object}
 *     The {{ SINGULAR_NAME | kebab }} query state and actions.
 */
export function use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	// Current query state and actions for the {{ SINGULAR_NAME | kebab }} record.
	const current{{ SINGULAR_NAME | pascal }} = useQueryWrapper({
		/**
		 * Build query options for the current record ID.
		 *
		 * @returns  {object}
		 *     The query options for the current record.
		 */
		queryOptions: () => ({
			...{{ SINGULAR_NAME | camel }}QueryOptions(unref({{ ID_NAME }})),
			enabled: Boolean(unref({{ ID_NAME }})),
		}),
		/**
		 * Check whether the record response contains a record.
		 *
		 * @param  {object}  data
		 *     The current record response.
		 *
		 * @returns  {boolean}
		 *     Whether the response contains a record.
		 */
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
 *
 * @returns  {Promise<object>}
 *     The formatted {{ SINGULAR_NAME | kebab }} record.
 */
async function get{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	// API response for the requested record.
	const response = await get(`{{ ENDPOINT }}/${{{ ID_NAME }}}`);

	return format{{ NAME | pascal }}Response(response);
}

// Query options for a {{ SINGULAR_NAME | kebab }} record.
const {{ SINGULAR_NAME | camel }}QueryOptions = defineQueryOptions(({{ ID_NAME }}) => ({
	key: {{ NAME | constant }}_KEYS.byId({{ ID_NAME }}),
	/**
	 * Load the requested {{ SINGULAR_NAME | kebab }} record.
	 *
	 * @returns  {Promise<object>}
	 *     The formatted {{ SINGULAR_NAME | kebab }} record.
	 */
	query: () => get{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}),
}));
