{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ QUERY_KEY }}_KEYS, use{{ COMPOSABLE_NAME }}List } from ".";

/**
 * Create the {{ NAME | kebab }} list query wrapper in a Vue app context.
 */
function create{{ COMPOSABLE_NAME }}List() {
	return withAppContext(() => use{{ COMPOSABLE_NAME }}List());
}

describe("{{ NAME | kebab }} list", () => {
	setupConsole();

	const validResponse = {
		items: [
			{
				id: "item-123",
			},
		],
	};

	describe("{{ QUERY_KEY }}_KEYS", () => {
		test("Creates stable root and list keys", () => {
			expect({{ QUERY_KEY }}_KEYS.root).toEqual(["{{ NAME | kebab }}"]);
			expect({{ QUERY_KEY }}_KEYS.list()).toEqual(["{{ NAME | kebab }}", "list"]);
		});
	});

	describe("use{{ COMPOSABLE_NAME }}List", () => {
		test("Initialises with no {{ NAME | kebab }}", () => {
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ DATA_NAME }} } =
				create{{ COMPOSABLE_NAME }}List();

			expect({{ DATA_NAME }}.value).toEqual([]);
			expect(isInitialLoading.value).toBe(true);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ NAME | kebab }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ DATA_NAME }} } =
				create{{ COMPOSABLE_NAME }}List();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}");
			expect({{ DATA_NAME }}.value).toEqual(validResponse.items);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update {{ NAME | kebab }} when the request fails", async () => {
			{{ MOCK_API_NAME }}.get.mockRejectedValue(new Error("Request failed"));

			const { isReady, lastFetched, refetch, {{ DATA_NAME }} } = create{{ COMPOSABLE_NAME }}List();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ DATA_NAME }}.value).toEqual([]);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		describe("have{{ COMPOSABLE_NAME }}", () => {
			test("Is false when no {{ NAME | kebab }} are loaded", () => {
				const { have{{ COMPOSABLE_NAME }} } = create{{ COMPOSABLE_NAME }}List();

				expect(have{{ COMPOSABLE_NAME }}.value).toBe(false);
			});

			test("Is true when {{ NAME | kebab }} have been loaded", async () => {
				{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

				const { have{{ COMPOSABLE_NAME }}, refetch } = create{{ COMPOSABLE_NAME }}List();

				await refetch(true);

				expect(have{{ COMPOSABLE_NAME }}.value).toBe(true);
			});
		});
	});
});
