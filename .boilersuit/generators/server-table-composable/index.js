{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { computed, ref } from "vue";
import { refDebounced } from "@vueuse/core";

import { use{{ COMPOSABLE_NAME }}List } from "@/queries/{{ NAME | kebab }}";

const searchDebounceDelay = 300;

/**
 * Provide independent state for the {{ NAME | kebab }} server table.
 */
export function use{{ COMPOSABLE_NAME }}Table() {
	// Create controls inside the composable so table instances do not share state.
	const page = ref(1);
	const sort = ref("");
	const search = ref("");
	const debouncedSearch = refDebounced(search, searchDebounceDelay);

	const parameters = computed(() => ({
		page: page.value,
		sort: sort.value,
		search: debouncedSearch.value,
	}));

	const {
		isInitialLoading,
		isLoading,
		isRefreshing,
		refetch,
		{{ DATA_NAME }}: items,
	} = use{{ COMPOSABLE_NAME }}List(parameters);

	return {
		isFetching: isLoading,
		isInitialLoading,
		isRefreshing,
		items,
		page,
		parameters,
		refetch,
		search,
		sort,
	};
}
