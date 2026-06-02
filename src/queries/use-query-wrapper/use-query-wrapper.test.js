import { describe, expect, test, vi } from "vite-plus/test";

import { withAppContext } from "@test/unit/support/app-context";

import { useQueryWrapper } from "./use-query-wrapper";

// The stable key used by the test query.
const TEST_QUERY_KEY = ["test-query"];

/**
 * Create the test query wrapper in a Vue app context.
 *
 * @param  {object}  options
 *     The test wrapper options.
 * @param  {Function}  options.query
 *     The query function to call.
 * @param  {boolean}  [options.enabled]
 *     Whether the query should be enabled.
 * @param  {Function}  [options.isReady]
 *     The readiness rule to pass to the wrapper.
 */
function createTestQuery({ query, enabled = false, isReady } = {}) {
	return withAppContext(() =>
		useQueryWrapper({
			queryOptions: () => ({
				enabled: () => enabled,
				key: TEST_QUERY_KEY,
				query,
			}),
			isReady,
		}),
	);
}

describe("useQueryWrapper", () => {
	describe("Initialisation", () => {
		test("Initialises with no data", () => {
			const query = vi.fn();

			const { data, isInitialLoading, isReady, isRefreshing, lastFetched, refetch } =
				createTestQuery({ query });

			expect(data.value).toBe(null);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Does not call the query when disabled", () => {
			const query = vi.fn();

			createTestQuery({ enabled: false, query });

			expect(query).not.toHaveBeenCalled();
		});
	});

	describe("Computed", () => {
		test("Exposes successful query data", async () => {
			const result = { name: "Sophie" };
			const query = vi.fn().mockResolvedValue(result);

			const { data, isInitialLoading, isReady, isRefreshing, lastFetched, refetch } =
				createTestQuery({ query });

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect(data.value).toEqual(result);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBeInstanceOf(Date);
		});

		test("Uses the provided readiness rule", async () => {
			const query = vi.fn().mockResolvedValue({});

			const { isReady, refetch } = createTestQuery({
				isReady: (data) => Boolean(data.name),
				query,
			});

			await refetch(true);

			expect(isReady.value).toBe(false);
		});

		test("Leaves empty data and fetch time unset when the query fails", async () => {
			const query = vi.fn().mockRejectedValue(new Error("Request failed"));

			const { data, isReady, lastFetched, refetch } = createTestQuery({ query });

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect(data.value).toBe(null);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});
	});
});
