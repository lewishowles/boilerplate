import { useListQuery } from "@/queries/use-list-query/use-list-query";
import { {{ NAME | camel }}Domain } from "./definition.js";
import { mock{{ NAME | pascal }} } from "./mock.js";

/**
 * Provide access to the {{ NAME | words }} list.
 *
 * @param  {object}  [parameters]
 *     Query parameters for the {{ NAME | words }} list.
 *
 * @returns  {object}
 *     The {{ NAME | words }} query state and actions.
 */
export function use{{ NAME | pascal }}(parameters = {}) {
	// The shared list state, with its items renamed for this domain below.
	const { haveItems, items, ...current{{ NAME | pascal }} } = useListQuery({
		domain: {{ NAME | camel }}Domain,
		mockData: mock{{ NAME | pascal }},
		parameters,
		/**
		 * Build the query options for the current list parameters.
		 *
		 * @param  {object}  requestParameters
		 *     The parameters shared by the cache key and request.
		 *
		 * @returns  {object}
		 *     The cache key for these parameters, and an option that keeps the
		 *     previous page visible while the next one loads.
		 */
		queryOptions: (requestParameters) => ({
			key: {{ NAME | camel }}Domain.keys.list(requestParameters),
			/**
			 * Keep the previous page visible while the next page loads.
			 *
			 * @param  {object}  previousData
			 *     The previous list response.
			 *
			 * @returns  {object}
			 *     The response to display while loading.
			 */
			placeholderData: (previousData) => previousData,
		}),
	});

	return {
		...current{{ NAME | pascal }},
		have{{ NAME | pascal }}: haveItems,
		{{ NAME | camel }}: items,
	};
}
