import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";
import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { isFunction } from "@lewishowles/helpers/general";
import { getPathValue as getPropertyValue } from "@lewishowles/helpers/object";
import { computed, toValue } from "vue";

/**
 * Load and expose a domain list using its API settings and formatter.
 *
 * @param  {object}  options
 *     The list settings.
 * @param  {object}  options.domain
 *     The domain's API client, endpoint, and record formatter.
 * @param  {object}  options.mockData
 *     The fixture response to use in mock mode.
 * @param  {object|Function}  [options.parameters]
 *     Reactive request parameters for a server-side list.
 * @param  {object|Function}  options.queryOptions
 *     The list cache key and any other query options. A getter receives the
 *     current request parameters.
 *
 * @returns  {object}
 *     The query state, formatted items, total rows, and item presence.
 */
export function useListQuery({ domain, mockData, parameters, queryOptions }) {
	// The shared API settings for this domain.
	const { api, endpoint, format } = domain;

	/**
	 * Load the list, using fixture data in mock mode after the request is sent.
	 *
	 * @param  {object|undefined}  requestParameters
	 *     The parameters to send with the request, also used for its cache key.
	 *
	 * @throws  {Error}
	 *     The API error when mock data is disabled.
	 *
	 * @returns  {Promise<object>}
	 *     The response with formatted items.
	 */
	async function loadList(requestParameters) {
		// Whether this request uses fixture data.
		const isMockData = import.meta.env.VITE_MOCK_DATA === "true";

		// The response from the API request.
		let response;

		try {
			response = await api.get(endpoint, requestParameters);
		} catch (error) {
			if (!isMockData) {
				throw error;
			}
		}

		// The fixture data in mock mode, otherwise the API response.
		const listResponse = isMockData ? mockData : response;
		// The items from the response before formatting.
		const items = getPropertyValue(listResponse, "items");

		return {
			...listResponse,
			items: isNonEmptyArray(items) ? items.map((item) => format(item)) : [],
		};
	}

	// The current list query and its loading state.
	const currentList = useQueryWrapper({
		/**
		 * Add the shared list request to the caller's cache key and options.
		 *
		 * @returns  {object}
		 *     The query options for the current list.
		 */
		queryOptions: () => {
			// The parameters shared by the cache key and this request.
			const requestParameters = toValue(parameters);

			// The options for the current parameter values.
			const currentQueryOptions = isFunction(queryOptions)
				? queryOptions(requestParameters)
				: toValue(queryOptions);

			return {
				...currentQueryOptions,
				/**
				 * Load the list with the parameters used for this cache key.
				 *
				 * @returns  {Promise<object>}
				 *     The response with formatted items.
				 */
				query: () => loadList(requestParameters),
			};
		},
	});

	// The formatted items, or an empty list before a response loads.
	const items = computed(() => getPropertyValue(currentList.data.value, "items") ?? []);
	// The row count reported by the server, or 0 when there is none.
	const totalRows = computed(() => getPropertyValue(currentList.data.value, "itemsTotal") ?? 0);
	// Whether the current response contains any items.
	const haveItems = computed(() => isNonEmptyArray(items.value));

	return {
		...currentList,
		haveItems,
		items,
		totalRows,
	};
}
