import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";

import { use{{ NAME | pascal }} } from "@/queries/{{ NAME | kebab }}";

// Delay search requests until typing pauses.
const searchDebounceDelay = 300;

/**
 * Provide independent state for the {{ NAME | kebab }} server table.
 *
 * @returns  {object}
 *     The table state and {{ NAME | kebab }} query actions.
 */
export function use{{ NAME | pascal }}Table() {
	// Create controls inside the composable so table instances do not share
	// state.
	// The current page number for the table.
	const page = ref(1);
	// The search text entered into the table.
	const search = ref("");
	// The selected table sort.
	const sort = ref(null);
	// The search text after the debounce delay.
	const debouncedSearch = refDebounced(search, searchDebounceDelay);

	// Keep the table inputs together for query keys and refetches.
	const parameters = computed(() => ({
		page: page.value,
		search: debouncedSearch.value,
		sort: sort.value,
	}));

	// Query state and actions for the {{ NAME | kebab }} list.
	const {
		error,
		isInitialLoading,
		isLoading,
		isReady,
		isRefreshing,
		lastFetched,
		refetch,
		{{ NAME | camel }},
		totalRows,
	} = use{{ NAME | pascal }}(parameters);

	return {
		error,
		// Use the table's fetching name so callers do not depend on query
		// terminology.
		isFetching: isLoading,
		isInitialLoading,
		isReady,
		isRefreshing,
		lastFetched,
		{{ NAME | camel }},
		page,
		parameters,
		refetch,
		search,
		sort,
		totalRows,
	};
}
