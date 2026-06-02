{{ set QUERY_KEY = NAME | constant }}
{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@test/unit/support/app-context";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ QUERY_KEY }}_QUERY_KEY, use{{ COMPOSABLE_NAME }} } from ".";

/**
 * Create the {{ NAME | kebab }} query wrapper in a Vue app context.
 *
 * @param  {string|null}  {{ ID_NAME }}
 *     The item ID to pass to the query wrapper.
 */
function create{{ COMPOSABLE_NAME }}({{ ID_NAME }} = "item-123") {
	return withAppContext(() => use{{ COMPOSABLE_NAME }}({{ ID_NAME }}));
}

describe("{{ NAME | kebab }}", () => {
	console.error = vi.fn();

	const sampleResponse = {
		id: "item-123",
	};

	describe("{{ QUERY_KEY }}_QUERY_KEY", () => {
		test("Creates a stable {{ NAME | kebab }} query key", () => {
			expect({{ QUERY_KEY }}_QUERY_KEY("item-123")).toEqual(["{{ NAME | kebab }}", "item-123"]);
		});
	});

	describe("use{{ COMPOSABLE_NAME }}", () => {
		test("Initialises with no {{ NAME | kebab }} details", () => {
			const {
				have{{ COMPOSABLE_NAME }},
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				{{ DATA_NAME }},
			} = create{{ COMPOSABLE_NAME }}(null);

			expect({{ DATA_NAME }}.value).toBe(null);
			expect(have{{ COMPOSABLE_NAME }}.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ NAME | kebab }} details", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(sampleResponse);

			const {
				have{{ COMPOSABLE_NAME }},
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				{{ DATA_NAME }},
			} = create{{ COMPOSABLE_NAME }}();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}/item-123");
			expect({{ DATA_NAME }}.value).toEqual(sampleResponse);
			expect(have{{ COMPOSABLE_NAME }}.value).toBe(true);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update {{ NAME | kebab }} details when the request fails", async () => {
			{{ MOCK_API_NAME }}.get.mockRejectedValue(new Error("Request failed"));

			const { have{{ COMPOSABLE_NAME }}, isReady, lastFetched, refetch, {{ DATA_NAME }} } =
				create{{ COMPOSABLE_NAME }}();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ DATA_NAME }}.value).toBe(null);
			expect(have{{ COMPOSABLE_NAME }}.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});
	});
});
