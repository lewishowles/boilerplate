import { useListQuery } from "./use-list-query";
import { withAppContext } from "@lewishowles/testing/vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick, ref } from "vue";

/**
 * Create a list query with a test API in a Vue app context.
 *
 * @param  {object}  [options]
 *     Settings for the test list.
 * @param  {object}  [options.response]
 *     The response returned by the test API.
 * @param  {object}  [options.mockData]
 *     The fixture response for mock mode.
 * @param  {object|Function}  [options.parameters]
 *     Reactive request parameters for a server list.
 * @param  {object|Function}  [options.queryOptions]
 *     The list cache key and any other query options.
 *
 * @returns  {object}
 *     The query state and its API and formatter spies.
 */
function createList({ response, mockData, parameters, queryOptions } = {}) {
	// The test API request, which resolves with the given response.
	const get = vi.fn().mockResolvedValue(response);
	// The test formatter, which marks each item so formatting is visible.
	const format = vi.fn((item) => ({ ...item, derived: {} }));
	// The domain definition passed to the list query.
	const domain = { api: { get }, endpoint: "records", format };

	// The list query state created inside the app context.
	const list = withAppContext(() =>
		useListQuery({
			domain,
			mockData,
			parameters,
			queryOptions: queryOptions ?? { key: ["records", "list"] },
		}),
	);

	return { ...list, format, get };
}

describe("useListQuery", () => {
	beforeEach(() => {
		vi.stubEnv("VITE_MOCK_DATA", "false");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	test("Starts with empty items and the shared query state", () => {
		// Query state returned before a response is loaded.
		const { haveItems, isInitialLoading, isReady, items, lastFetched, refetch, totalRows } =
			createList();

		expect(items.value).toEqual([]);
		expect(totalRows.value).toBe(0);
		expect(haveItems.value).toBe(false);
		expect(isInitialLoading.value).toBe(true);
		expect(isReady.value).toBe(false);
		expect(lastFetched.value).toBe(null);
		expect(refetch).toBeTypeOf("function");
	});

	test("Requests and formats list items without parameters", async () => {
		// The API response with one item and a server total.
		const response = { items: [{ id: "record-1" }], itemsTotal: 42 };

		// Query state and the test spies for this list.
		const { format, get, haveItems, isReady, items, lastFetched, refetch, totalRows } = createList({
			response,
		});

		await refetch(true);

		expect(get).toHaveBeenCalledWith("records", undefined);
		expect(format).toHaveBeenCalledWith(response.items[0]);
		expect(items.value).toEqual([{ id: "record-1", derived: {} }]);
		expect(totalRows.value).toBe(42);
		expect(haveItems.value).toBe(true);
		expect(isReady.value).toBe(true);
		expect(lastFetched.value).toBeInstanceOf(Date);
	});

	test("Uses the current parameters for a server list", async () => {
		// The reactive parameters for the server list.
		const parameters = ref({ page: 2 });

		// The API spy and refetch action for this list.
		const { get, refetch } = createList({
			parameters,
			queryOptions: (requestParameters) => ({ key: ["records", "list", requestParameters] }),
			response: { items: [] },
		});

		await refetch(true);

		expect(get).toHaveBeenCalledWith("records", { page: 2 });

		parameters.value = { page: 3 };

		await nextTick();
		await refetch(true);

		expect(get).toHaveBeenLastCalledWith("records", { page: 3 });
	});

	test("Keeps previous items visible while the next page loads", async () => {
		// The page selected by the list caller.
		const parameters = ref({ page: 1 });

		// The query and API spy for the server list.
		const { get, items, refetch } = createList({
			parameters,
			queryOptions: (requestParameters) => ({
				key: ["records", "list", requestParameters],
				placeholderData: (previousData) => previousData,
			}),
			response: { items: [{ id: "page-1" }] },
		});

		await refetch(true);

		expect(items.value).toEqual([{ id: "page-1", derived: {} }]);

		// Resolves the second page request after the first page is checked.
		let resolveNextRequest;

		// The second page request, held open so the first page stays on screen.
		const nextRequest = new Promise((resolve) => {
			resolveNextRequest = resolve;
		});

		get.mockReturnValueOnce(nextRequest);

		parameters.value = { page: 2 };

		await vi.waitFor(() => expect(get).toHaveBeenLastCalledWith("records", { page: 2 }), {
			timeout: 500,
		});

		expect(items.value).toEqual([{ id: "page-1", derived: {} }]);

		resolveNextRequest({ items: [{ id: "page-2" }] });

		await vi.waitFor(() => expect(items.value).toEqual([{ id: "page-2", derived: {} }]), {
			timeout: 500,
		});
	});

	test.each([undefined, {}, { items: null }, { items: {} }, { items: [] }])(
		"Treats a response without items as an empty list: %s",
		async (response) => {
			// Query state returned after the response loads.
			const { haveItems, items, refetch, totalRows } = createList({ response });

			await refetch(true);

			expect(items.value).toEqual([]);
			expect(totalRows.value).toBe(0);
			expect(haveItems.value).toBe(false);
		},
	);

	test("Returns fixture data after sending a request in mock mode", async () => {
		vi.stubEnv("VITE_MOCK_DATA", "true");

		// The fixture response returned in mock mode.
		const mockData = { items: [{ id: "fixture" }], itemsTotal: 3 };

		// Query state and the API spy for the mock-mode list.
		const { get, items, refetch, totalRows } = createList({
			mockData,
		});

		get.mockRejectedValue(new Error("Request failed"));

		await refetch(true);

		expect(get).toHaveBeenCalledWith("records", undefined);
		expect(items.value).toEqual([{ id: "fixture", derived: {} }]);
		expect(totalRows.value).toBe(3);
	});

	test("Rejects with the request error when mock mode is disabled", async () => {
		// Query state and the API spy for the failing list.
		const { get, isReady, items, lastFetched, refetch } = createList();

		get.mockRejectedValue(new Error("Request failed"));

		await expect(refetch(true)).rejects.toThrow("Request failed");

		expect(items.value).toEqual([]);
		expect(isReady.value).toBe(false);
		expect(lastFetched.value).toBe(null);
	});
});
