import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";

import { use{{ NAME | pascal }} } from "@/queries/{{ NAME | kebab }}";

const searchDebounceDelay = 300;

/**
 * Provide independent state for the {{ NAME | kebab }} server table.
 */
export function use{{ NAME | pascal }}Table() {
	// Create controls inside the composable so table instances do not share state.
	const page = ref(1);
	const sort = ref(null);
	const search = ref(null);
	const debouncedSearch = refDebounced(search, searchDebounceDelay);

	const parameters = computed(() => ({
		page: page.value,
		sort: sort.value,
		search: debouncedSearch.value,
	}));

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
