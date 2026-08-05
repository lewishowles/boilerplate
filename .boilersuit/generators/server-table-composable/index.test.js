{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick, ref } from "vue";
import { withAppContext } from "@lewishowles/testing/vue";

const mockUse{{ COMPOSABLE_NAME }}List = vi.hoisted(() => vi.fn());

vi.mock("@/queries/{{ NAME | kebab }}", () => ({
	use{{ COMPOSABLE_NAME }}List: mockUse{{ COMPOSABLE_NAME }}List,
}));

import { use{{ COMPOSABLE_NAME }}Table } from ".";

const queryParameters = [];

/**
 * Create the {{ NAME | kebab }} table composable in a Vue app context.
 */
function create{{ COMPOSABLE_NAME }}Table() {
	return withAppContext(() => use{{ COMPOSABLE_NAME }}Table());
}

/**
 * Create the mocked {{ NAME | kebab }} list query state.
 */
function createQueryState() {
	return {
		isInitialLoading: ref(false),
		isLoading: ref(false),
		isRefreshing: ref(false),
		refetch: vi.fn(),
		{{ DATA_NAME }}: ref([
			{
				id: "item-123",
			},
		]),
	};
}

describe("{{ NAME | kebab }} table", () => {
	beforeEach(() => {
		queryParameters.length = 0;
		mockUse{{ COMPOSABLE_NAME }}List.mockReset();
		mockUse{{ COMPOSABLE_NAME }}List.mockImplementation((parameters) => {
			queryParameters.push(parameters);

			return createQueryState();
		});
	});

	describe("use{{ COMPOSABLE_NAME }}Table", () => {
		test("Exposes table state and query items", () => {
			const {
				isFetching,
				isInitialLoading,
				isRefreshing,
				items,
				page,
				parameters,
				refetch,
				search,
				sort,
			} = create{{ COMPOSABLE_NAME }}Table();

			expect(items.value).toEqual([{ id: "item-123" }]);
			expect(isFetching.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(page.value).toBe(1);
			expect(parameters.value).toEqual({ page: 1, sort: "", search: "" });
			expect(refetch).toBeTypeOf("function");
			expect(search.value).toBe("");
			expect(sort.value).toBe("");
		});

		test("Propagates page and sort into query parameters immediately", () => {
			const { page, parameters, sort } = create{{ COMPOSABLE_NAME }}Table();

			page.value = 2;
			sort.value = "name";

			expect(parameters.value).toEqual({ page: 2, sort: "name", search: "" });
		});

		test("Debounces search before updating query parameters", async () => {
			vi.useFakeTimers();

			try {
				const { parameters, search } = create{{ COMPOSABLE_NAME }}Table();

				search.value = "example";

				await nextTick();

				expect(parameters.value.search).toBe("");

				vi.advanceTimersByTime(300);
				await nextTick();

				expect(parameters.value.search).toBe("example");
			} finally {
				vi.useRealTimers();
			}
		});

		test("Creates independent state for each table instance", () => {
			const firstTable = create{{ COMPOSABLE_NAME }}Table();
			const secondTable = create{{ COMPOSABLE_NAME }}Table();

			firstTable.page.value = 2;
			firstTable.sort.value = "name";
			firstTable.search.value = "example";

			expect(secondTable.page.value).toBe(1);
			expect(secondTable.sort.value).toBe("");
			expect(secondTable.search.value).toBe("");
			expect(queryParameters).toHaveLength(2);
		});
	});
});
