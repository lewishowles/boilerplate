import { describe, expect, test } from "vite-plus/test";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ NAME | constant }}_KEYS, use{{ NAME | pascal }} } from ".";

/**
 * Create the {{ NAME | kebab }} list query wrapper in a Vue app context.
 *
 * @returns  {object}
 *     The query state and {{ NAME | kebab }} list data.
 */
function create{{ NAME | pascal }}() {
	return withAppContext(() => use{{ NAME | pascal }}());
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

	describe("{{ NAME | constant }}_KEYS", () => {
		test("Creates stable root and list keys", () => {
			expect({{ NAME | constant }}_KEYS.root).toEqual(["{{ NAME | kebab }}"]);
			expect({{ NAME | constant }}_KEYS.list()).toEqual(["{{ NAME | kebab }}", "list"]);
		});
	});

	describe("use{{ NAME | pascal }}", () => {
		test("Initialises with no {{ NAME | kebab }}", () => {
			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ NAME | camel }} } =
				create{{ NAME | pascal }}();

			expect({{ NAME | camel }}.value).toEqual([]);
			expect(isInitialLoading.value).toBe(true);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ NAME | kebab }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			const { isInitialLoading, isReady, isRefreshing, lastFetched, refetch, {{ NAME | camel }} } =
				create{{ NAME | pascal }}();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}");
			expect({{ NAME | camel }}.value).toEqual(validResponse.items);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update {{ NAME | kebab }} when the request fails", async () => {
			{{ MOCK_API_NAME }}.get.mockRejectedValue(new Error("Request failed"));

			const { isReady, lastFetched, refetch, {{ NAME | camel }} } = create{{ NAME | pascal }}();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ NAME | camel }}.value).toEqual([]);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});

		describe("have{{ NAME | pascal }}", () => {
			test("Is false when no {{ NAME | kebab }} are loaded", () => {
				const { have{{ NAME | pascal }} } = create{{ NAME | pascal }}();

				expect(have{{ NAME | pascal }}.value).toBe(false);
			});

			test("Is true when {{ NAME | kebab }} have been loaded", async () => {
				{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

				const { have{{ NAME | pascal }}, refetch } = create{{ NAME | pascal }}();

				await refetch(true);

				expect(have{{ NAME | pascal }}.value).toBe(true);
			});
		});
	});
});
