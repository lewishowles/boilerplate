import { {{ NAME | constant }}_KEYS } from "./keys.js";
import { computed, unref } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import { format{{ SINGULAR_NAME | pascal }} } from "./helpers.js";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import {{ API_COMPOSABLE }} from "{{ API_IMPORT }}";

// API method used to load a record.
const { get } = {{ API_COMPOSABLE }}();

/**
 * Provide access to a {{ SINGULAR_NAME | kebab }} record.
 *
 * @param  {string|object}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | kebab }} ID.
 *
 * @returns  {object}
 *     Query state and the current {{ SINGULAR_NAME | kebab }} record.
 */
export function use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}) {
	// Query state for the current record.
	const current{{ SINGULAR_NAME | pascal }} = useQueryWrapper({
		/**
		 * Build query options for the current record ID.
		 *
		 * @returns  {object}
		 *     Query options for the current record.
		 */
		queryOptions: () => ({
			...{{ SINGULAR_NAME | camel }}QueryOptions(unref({{ ID_NAME }})),
			enabled: Boolean(unref({{ ID_NAME }})),
		}),
		/**
		 * Confirm that the response contains a record.
		 *
		 * @param  {unknown}  data
		 *     The query response data.
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

	return format{{ SINGULAR_NAME | pascal }}(response);
}

// Query options for a {{ SINGULAR_NAME | kebab }} record.
const {{ SINGULAR_NAME | camel }}QueryOptions = defineQueryOptions(({{ ID_NAME }}) => ({
	key: {{ NAME | constant }}_KEYS.byId({{ ID_NAME }}),
	/**
	 * Load the current {{ SINGULAR_NAME | kebab }} record.
	 *
	 * @returns  {Promise<object>}
	 *     The formatted {{ SINGULAR_NAME | kebab }} record.
	 */
	query: () => get{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}),
}));
