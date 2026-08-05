import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import mockApi from "@test/unit/support/mock-api";

import { EXAMPLE_KEYS, useExampleList } from ".";

/**
 * Create the example list query wrapper in a Vue app context.
 */
function createExampleList() {
	return withAppContext(() => useExampleList());
}

describe("example list", () => {
	setupConsole();

	const validResponse = {
		items: [
			{
				id: "item-123",
			},
		],
	};

	describe("EXAMPLE_KEYS", () => {
		test("Creates stable root and list keys", () => {
			expect(EXAMPLE_KEYS.root).toEqual(["example"]);
			expect(EXAMPLE_KEYS.list()).toEqual(["example", "list"]);
		});
	});

	describe("useExampleList", () => {
		test("Initialises with no example", () => {
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, example } =
				createExampleList();

			expect(example.value).toEqual([]);
			expect(isInitialLoading.value).toBe(true);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores example", async () => {
			mockApi.get.mockResolvedValue(validResponse);

			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, example } =
				createExampleList();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect(mockApi.get).toHaveBeenCalledWith("examples");
			expect(example.value).toEqual(validResponse.items);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update example when the request fails", async () => {
			mockApi.get.mockRejectedValue(new Error("Request failed"));

			const { isReady, lastFetched, refetch, example } = createExampleList();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect(example.value).toEqual([]);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		describe("haveExample", () => {
			test("Is false when no example are loaded", () => {
				const { haveExample } = createExampleList();

				expect(haveExample.value).toBe(false);
			});

			test("Is true when example have been loaded", async () => {
				mockApi.get.mockResolvedValue(validResponse);

				const { haveExample, refetch } = createExampleList();

				await refetch(true);

				expect(haveExample.value).toBe(true);
			});
		});
	});
});
