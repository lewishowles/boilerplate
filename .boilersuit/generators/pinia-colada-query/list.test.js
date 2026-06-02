{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@test/unit/support/app-context";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ QUERY_KEY }}_QUERY_KEY, use{{ COMPOSABLE_NAME }} } from ".";

/**
 * Create the {{ NAME | kebab }} query wrapper in a Vue app context.
 */
function create{{ COMPOSABLE_NAME }}() {
	return withAppContext(() => use{{ COMPOSABLE_NAME }}());
}

describe("{{ NAME | kebab }}", () => {
	console.error = vi.fn();

	const validResponse = {
		items: [
			{
				id: "item-123",
			},
		],
	};

	describe("{{ QUERY_KEY }}_QUERY_KEY", () => {
		test("Creates a stable {{ NAME | kebab }} query key", () => {
			expect({{ QUERY_KEY }}_QUERY_KEY).toEqual(["{{ NAME | kebab }}", "list"]);
		});
	});

	describe("use{{ COMPOSABLE_NAME }}", () => {
		test("Initialises with no {{ NAME | kebab }}", () => {
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ DATA_NAME }} } =
				create{{ COMPOSABLE_NAME }}();

			expect({{ DATA_NAME }}.value).toEqual([]);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ NAME | kebab }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ DATA_NAME }} } =
				create{{ COMPOSABLE_NAME }}();

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

			const { isReady, lastFetched, refetch, {{ DATA_NAME }} } = create{{ COMPOSABLE_NAME }}();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ DATA_NAME }}.value).toEqual([]);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		describe("have{{ COMPOSABLE_NAME }}", () => {
			test("Is false when no {{ NAME | kebab }} are loaded", () => {
				const { have{{ COMPOSABLE_NAME }} } = create{{ COMPOSABLE_NAME }}();

				expect(have{{ COMPOSABLE_NAME }}.value).toBe(false);
			});

			test("Is true when {{ NAME | kebab }} have been loaded", async () => {
				{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

				const { have{{ COMPOSABLE_NAME }}, refetch } = create{{ COMPOSABLE_NAME }}();

				await refetch(true);

				expect(have{{ COMPOSABLE_NAME }}.value).toBe(true);
			});
		});
	});
});
