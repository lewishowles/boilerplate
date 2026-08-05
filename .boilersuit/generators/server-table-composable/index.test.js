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
		error: ref(null),
		isInitialLoading: ref(false),
		isLoading: ref(false),
		isReady: ref(true),
		isRefreshing: ref(false),
		lastFetched: ref(new Date("2026-01-01T00:00:00.000Z")),
		refetch: vi.fn(),
		{{ DATA_NAME }}: ref([
			{
				id: "item-123",
			},
		]),
		totalRows: ref(42),
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
				error,
				isFetching,
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
			} = create{{ COMPOSABLE_NAME }}Table();

			expect(error.value).toBe(null);
			expect(items.value).toEqual([{ id: "item-123" }]);
			expect(isFetching.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toEqual(new Date("2026-01-01T00:00:00.000Z"));
			expect(page.value).toBe(1);
			expect(parameters.value).toEqual({ page: 1, sort: null, search: "" });
			expect(refetch).toBeTypeOf("function");
			expect(search.value).toBe("");
			expect(sort.value).toBe(null);
			expect(totalRows.value).toBe(42);
		});

		test("Propagates page and sort into query parameters immediately", () => {
			const { page, parameters, sort } = create{{ COMPOSABLE_NAME }}Table();

			page.value = 2;
			sort.value = { column: "name", direction: "descending" };

			expect(parameters.value).toEqual({
				page: 2,
				search: "",
				sort: { column: "name", direction: "descending" },
			});
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
			firstTable.sort.value = { column: "name", direction: "descending" };
			firstTable.search.value = "example";

			expect(secondTable.page.value).toBe(1);
			expect(secondTable.sort.value).toBe(null);
			expect(secondTable.search.value).toBe("");
			expect(queryParameters).toHaveLength(2);
		});
	});
});
