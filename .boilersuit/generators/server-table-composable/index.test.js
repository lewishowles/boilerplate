import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick, ref } from "vue";
import { withAppContext } from "@lewishowles/testing/vue";

// The mocked table query function used by each test.
const mockUse{{ NAME | pascal }} = vi.hoisted(() => vi.fn());

vi.mock("@/queries/{{ NAME | kebab }}", () => ({
	use{{ NAME | pascal }}: mockUse{{ NAME | pascal }},
}));

import { use{{ NAME | pascal }}Table } from ".";

// Parameters from every mocked query call, so tests can count and inspect them.
// Emptied before each test.
const queryParameters = [];

/**
 * Create the {{ NAME | kebab }} table composable in a Vue app context.
 *
 * @returns  {object}
 *     The table state exposed by the composable.
 */
function create{{ NAME | pascal }}Table() {
	return withAppContext(() => use{{ NAME | pascal }}Table());
}

/**
 * Create the mocked {{ NAME | kebab }} list query state.
 *
 * @returns  {object}
 *     The reactive state returned by the mocked query.
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
		{{ NAME }}: ref([
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
		mockUse{{ NAME | pascal }}.mockReset();
		mockUse{{ NAME | pascal }}.mockImplementation((parameters) => {
			queryParameters.push(parameters);

			return createQueryState();
		});
	});

	describe("use{{ NAME | pascal }}Table", () => {
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
			} = create{{ NAME | pascal }}Table();

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
			const { page, parameters, sort } = create{{ NAME | pascal }}Table();

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
				const { parameters, search } = create{{ NAME | pascal }}Table();

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
			const firstTable = create{{ NAME | pascal }}Table();
			const secondTable = create{{ NAME | pascal }}Table();

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
