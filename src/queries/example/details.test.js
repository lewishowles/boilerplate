import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import mockApi from "@test/unit/support/mock-api";

import { EXAMPLE_KEYS, useExampleDetails } from ".";

/**
 * Create the example details query wrapper in a Vue app context.
 *
 * @param  {string|null}  id
 *     The item ID to pass to the query wrapper.
 */
function createExampleDetails(id = "item-123") {
	return withAppContext(() => useExampleDetails(id));
}

describe("example details", () => {
	setupConsole();

	const sampleResponse = {
		id: "item-123",
	};

	describe("EXAMPLE_KEYS", () => {
		test("Creates a stable record key", () => {
			expect(EXAMPLE_KEYS.byId("item-123")).toEqual(["example", "item-123"]);
		});
	});

	describe("useExampleDetails", () => {
		test("Initialises with no example details", () => {
			const {
				haveExample,
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				example,
			} = createExampleDetails(null);

			expect(example.value).toBe(null);
			expect(haveExample.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores example details", async () => {
			mockApi.get.mockResolvedValue(sampleResponse);

			const {
				haveExample,
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				example,
			} = createExampleDetails();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect(mockApi.get).toHaveBeenCalledWith("examples/item-123");
			expect(example.value).toEqual(sampleResponse);
			expect(haveExample.value).toBe(true);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update example details when the request fails", async () => {
			mockApi.get.mockRejectedValue(new Error("Request failed"));

			const { haveExample, isReady, lastFetched, refetch, example } = createExampleDetails();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect(example.value).toBe(null);
			expect(haveExample.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});
	});
});
