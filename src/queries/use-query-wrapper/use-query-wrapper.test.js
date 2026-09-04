import { describe, expect, test, vi } from "vite-plus/test";

import { withAppContext } from "@lewishowles/testing/vue";

/**
 * Create a promise that can be resolved or rejected by the test.
 *
 * @returns  {object}
 *     The promise and its test-controlled settlement functions.
 */
function createDeferred() {
	// Promise rejection function exposed to the test.
	let reject;
	// Promise resolution function exposed to the test.
	let resolve;

	// Promise controlled by the test.
	const promise = new Promise((promiseResolve, promiseReject) => {
		reject = promiseReject;
		resolve = promiseResolve;
	});

	return { promise, reject, resolve };
}

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
 * @param  {boolean}  [options.enabled=false]
 *     Whether the query should be enabled.
 * @param  {Function}  [options.isReady]
 *     The readiness rule to pass to the wrapper.
 *
 * @returns  {object}
 *     The test query wrapper state and actions.
 */
function createTestQuery({ query, enabled = false, isReady } = {}) {
	return withAppContext(() =>
		useQueryWrapper({
			/**
			 * Builds options for the test query.
			 *
			 * @returns  {object}
			 *     The test query options.
			 */
			queryOptions: () => ({
				/**
				 * Determine whether the test query is enabled.
				 *
				 * @returns  {boolean}
				 *     Whether the test query should run.
				 */
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
			// Query function used by the test wrapper.
			const query = vi.fn();

			// Query state returned by the test wrapper.
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
			// Query function used by the test wrapper.
			const query = vi.fn();

			createTestQuery({ enabled: false, query });

			expect(query).not.toHaveBeenCalled();
		});
	});

	describe("Computed", () => {
		test("Exposes successful query data", async () => {
			// Successful query result.
			const result = { name: "Sophie" };
			// Query function returning the successful result.
			const query = vi.fn().mockResolvedValue(result);

			// Query state returned by the test wrapper.
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
			// Query function returning empty data.
			const query = vi.fn().mockResolvedValue({});

			// Query state returned by the test wrapper.
			const { isReady, refetch } = createTestQuery({
				/**
				 * Check whether the result includes a name.
				 *
				 * @param  {object}  data
				 *     The query data to check.
				 *
				 * @returns  {boolean}
				 *     Whether the query data includes a name.
				 */
				isReady: (data) => Boolean(data.name),
				query,
			});

			await refetch(true);

			expect(isReady.value).toBe(false);
		});

		test("Leaves empty data and fetch time unset when the query fails", async () => {
			// Query function that rejects with a request error.
			const query = vi.fn().mockRejectedValue(new Error("Request failed"));

			// Query state returned by the test wrapper.
			const { data, isReady, lastFetched, refetch } = createTestQuery({ query });

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect(data.value).toBe(null);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		test("Does not update the fetch time while a refresh is in flight", async () => {
			// Initial successful query result.
			const firstResult = { name: "Sophie" };
			// Result returned after the controlled refresh.
			const secondResult = { name: "Jane" };
			// Deferred request used to hold the refresh in progress.
			const secondRequest = createDeferred();

			// Query function returning the initial and deferred results.
			const query = vi
				.fn()
				.mockResolvedValueOnce(firstResult)
				.mockReturnValueOnce(secondRequest.promise);

			// Query state returned by the test wrapper.
			const { data, lastFetched, refetch } = createTestQuery({ query });

			await refetch(true);

			// Fetch time recorded before the controlled refresh.
			const firstFetchTime = lastFetched.value;
			// Pending refresh action.
			const refresh = refetch(true);

			expect(lastFetched.value).toBe(firstFetchTime);

			secondRequest.resolve(secondResult);
			await refresh;

			expect(data.value).toEqual(secondResult);
			expect(firstFetchTime).toBeInstanceOf(Date);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(lastFetched.value.getTime()).toBeGreaterThanOrEqual(firstFetchTime.getTime());
		});
	});
});
