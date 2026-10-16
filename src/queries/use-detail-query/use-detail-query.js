import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { computed, toValue } from "vue";

/**
 * Load and expose a domain record using its API settings and formatter.
 *
 * @param  {object}  options
 *     The detail settings.
 * @param  {object}  options.domain
 *     The domain's API client, endpoint, cache keys, and record formatter.
 * @param  {string|Ref<string>}  options.id
 *     The record ID. No request is sent while it is empty, and a new ID loads
 *     that record under its own cache key.
 *
 * @returns  {object}
 *     The query state, the formatted record, and whether a record has loaded.
 */
export function useDetailQuery({ domain, id }) {
	// The shared API settings for this domain.
	const { api, endpoint, format, keys } = domain;

	// The current record query and its loading state.
	const currentRecord = useQueryWrapper({
		/**
		 * Describe the request for the current ID. This runs again whenever the
		 * ID changes.
		 *
		 * @returns  {object}
		 *     The cache key, whether to send the request, and the request
		 *     itself.
		 */
		queryOptions: () => {
			// The ID shared by the cache key and this request.
			const recordId = toValue(id);

			return {
				key: keys.byId(recordId),
				enabled: Boolean(recordId),
				/**
				 * Load and format the requested record.
				 *
				 * @returns  {Promise<object>}
				 *     The formatted record.
				 */
				query: async () => format(await api.get(`${endpoint}/${recordId}`)),
			};
		},
		/**
		 * Check whether the response contains a record.
		 *
		 * @param  {object}  data
		 *     The current record response.
		 *
		 * @returns  {boolean}
		 *     Whether the response contains a record.
		 */
		isReady: (data) => isNonEmptyObject(data),
	});

	// The formatted record, or null before a response loads.
	const record = currentRecord.data;
	// Whether the current response contains a record.
	const haveRecord = computed(() => isNonEmptyObject(record.value));

	return {
		...currentRecord,
		haveRecord,
		record,
	};
}
