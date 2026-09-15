import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";

import { use{{ NAME | pascal }} } from "@/queries/{{ NAME | kebab }}";

// Delay, in milliseconds, before search text updates the server query.
const searchDebounceDelay = 300;

/**
 * Provide state for the {{ NAME | kebab }} server table.
 *
 * Each call creates its own controls, so table instances do not share page,
 * sort, or search state.
 *
 * @returns  {object}
 *     Table controls and the state returned by the server query.
 */
export function use{{ NAME | pascal }}Table() {
	// The current page sent to the server query.
	const page = ref(1);
	// The current sort applied to the server query.
	const sort = ref(null);
	// The search text entered for the table.
	const search = ref(null);
	// The debounced search text used by the server query.
	const debouncedSearch = refDebounced(search, searchDebounceDelay);

	// Query parameters derived from the table controls.
	const parameters = computed(() => ({
		page: page.value,
		sort: sort.value,
		search: debouncedSearch.value,
	}));

	// Query state and rows returned for the current table parameters.
	const {
		error,
		isInitialLoading,
		isLoading,
		isReady,
		isRefreshing,
		lastFetched,
		refetch,
		{{ NAME }}: items,
		totalRows,
	} = use{{ NAME | pascal }}(parameters);

	return {
		error,
		isFetching: isLoading,
		isInitialLoading,
		isReady,
		isRefreshing,
		items,
		lastFetched,
		page,
		parameters,
		refetch,
		search,
		sort,
		totalRows,
	};
}
