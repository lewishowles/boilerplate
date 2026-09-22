import { describe, expect, test } from "vite-plus/test";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ NAME | constant }}_KEYS, use{{ NAME | pascal }} } from ".";

/**
 * Create the {{ NAME | kebab }} list query wrapper in a Vue app context.
 *
 * @param  {object}  parameters
 *     Query parameters for the {{ NAME | kebab }} list.
 *
 * @returns  {object}
 *     The {{ NAME | kebab }} query state and actions.
 */
function create{{ NAME | pascal }}(parameters) {
	return withAppContext(() => use{{ NAME | pascal }}(parameters));
}

describe("{{ NAME | kebab }} list", () => {
	setupConsole();

	// Parameters passed to the list query.
	const parameters = {
		page: 2,
		sort: {
			column: "name",
			direction: "descending",
		},
		search: "example",
	};

	// Response returned by the list request.
	const validResponse = {
		items: [
			{
				id: "item-123",
			},
		],
		itemsTotal: 42,
	};

	describe("{{ NAME | constant }}_KEYS", () => {
		test("Creates a parameterised list key", () => {
			expect({{ NAME | constant }}_KEYS.root).toEqual(["{{ NAME | kebab }}"]);
			expect({{ NAME | constant }}_KEYS.list(parameters)).toEqual(["{{ NAME | kebab }}", "list", parameters]);
		});
	});

	describe("use{{ NAME | pascal }}", () => {
		test("Initialises with no {{ NAME | kebab }}", () => {
			// Query state returned before a response is loaded.
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ NAME | camel }}, totalRows } =
				create{{ NAME | pascal }}(parameters);

			expect({{ NAME | camel }}.value).toEqual([]);
			expect(totalRows.value).toBe(0);
			expect(isInitialLoading.value).toBe(true);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ NAME | kebab }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			// Query state returned after the response loads.
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ NAME | camel }}, totalRows } =
				create{{ NAME | pascal }}(parameters);

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}", parameters);
			expect({{ NAME | camel }}.value).toEqual(validResponse.items);
			expect(totalRows.value).toBe(validResponse.itemsTotal);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update {{ NAME | kebab }} when the request fails", async () => {
			{{ MOCK_API_NAME }}.get.mockRejectedValue(new Error("Request failed"));

			// Query state returned after the request fails.
			const { isReady, lastFetched, refetch, {{ NAME | camel }} } = create{{ NAME | pascal }}(parameters);

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ NAME | camel }}.value).toEqual([]);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		describe("have{{ NAME | pascal }}", () => {
			test("Is false when no {{ NAME | kebab }} are loaded", () => {
				// Presence state returned before any items are loaded.
				const { have{{ NAME | pascal }} } = create{{ NAME | pascal }}(parameters);

				expect(have{{ NAME | pascal }}.value).toBe(false);
			});

			test("Is true when {{ NAME | kebab }} have been loaded", async () => {
				{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

				// Presence state and refetch action for the loaded list.
				const { have{{ NAME | pascal }}, refetch } = create{{ NAME | pascal }}(parameters);

				await refetch(true);

				expect(have{{ NAME | pascal }}.value).toBe(true);
			});
		});
	});
});
