import { computed, ref, toValue, watch } from "vue";
import { useQuery, useQueryCache } from "@pinia/colada";

// The default readiness rule for query data.
const defaultIsReady = (data) => data !== null;

/**
 * Simplify usage of Pinia Colada by providing common query state.
 *
 * @param  {object}  options
 *     The wrapper options.
 * @param  {object|Function}  options.queryOptions
 *     The Pinia Colada query options or a getter returning them.
 * @param  {Function}  [options.isReady]
 *     The rule that decides whether successful data is usable.
 */
export function useQueryWrapper({ queryOptions, isReady = defaultIsReady }) {
	// The currently resolved query options.
	const resolvedQueryOptions = computed(() => toValue(queryOptions));
	// The current query key.
	const queryKey = computed(() => toValue(resolvedQueryOptions.value.key));
	// The caching layer from Pinia Colada.
	const queryCache = useQueryCache();
	// The query, which receives data from either the cache or the API.
	const query = useQuery(() => resolvedQueryOptions.value);
	// The returned query data.
	const data = computed(() => query.data.value ?? null);
	// When this query last successfully fetched usable data.
	const lastFetched = ref(null);

	// Whether this query is loading before any data is available.
	const isInitialLoading = computed(
		() => query.status.value === "pending" && query.isLoading.value,
	);

	// Whether this query has successfully loaded usable data.
	const queryIsReady = computed(
		() => query.status.value === "success" && isReady(data.value, query),
	);

	// Whether this query is refreshing existing data.
	const isRefreshing = computed(() => query.status.value === "success" && query.isLoading.value);

	// Keep the last fetched time in sync with data so cached data and new data
	// expose the same state shape to components.
	watch(
		[() => query.status.value, () => query.isLoading.value, data, queryKey],
		() => {
			if (query.status.value !== "success" || data.value === null) {
				lastFetched.value = null;

				return;
			}

			if (query.isLoading.value) {
				return;
			}

			const entry = queryCache.get(queryKey.value);

			lastFetched.value = new Date(entry?.when || Date.now());
		},
		{ immediate: true },
	);

	return {
		...query,
		data,
		isInitialLoading,
		isReady: queryIsReady,
		isRefreshing,
		lastFetched,
	};
}
