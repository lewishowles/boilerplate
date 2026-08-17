import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { {{ NAME | constant }}_KEYS, use{{ SINGULAR_NAME | pascal }}Details } from ".";

/**
 * Create the {{ SINGULAR_NAME | kebab }} details query wrapper in a Vue app context.
 *
 * @param  {string|null}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | kebab }} ID to pass to the query wrapper.
 */
function create{{ SINGULAR_NAME | pascal }}Details({{ ID_NAME }} = "item-123") {
	return withAppContext(() => use{{ SINGULAR_NAME | pascal }}Details({{ ID_NAME }}));
}

describe("{{ SINGULAR_NAME | kebab }} details", () => {
	setupConsole();

	const sampleResponse = {
		id: "item-123",
	};

	describe("{{ NAME | constant }}_KEYS", () => {
		test("Creates a stable record key", () => {
			expect({{ NAME | constant }}_KEYS.byId("item-123")).toEqual(["{{ NAME | kebab }}", "item-123"]);
		});
	});

	describe("use{{ SINGULAR_NAME | pascal }}Details", () => {
		test("Initialises with no {{ SINGULAR_NAME | kebab }} details", () => {
			const {
				have{{ SINGULAR_NAME | pascal }},
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				{{ SINGULAR_NAME | camel }},
			} = create{{ SINGULAR_NAME | pascal }}Details(null);

			expect({{ SINGULAR_NAME | camel }}.value).toBe(null);
			expect(have{{ SINGULAR_NAME | pascal }}.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores {{ SINGULAR_NAME | kebab }} details", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(sampleResponse);

			const {
				have{{ SINGULAR_NAME | pascal }},
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				{{ SINGULAR_NAME | camel }},
			} = create{{ SINGULAR_NAME | pascal }}Details();

			expect(lastFetched.value).toBe(null);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}/item-123");
			expect({{ SINGULAR_NAME | camel }}.value).toEqual(sampleResponse);
			expect(have{{ SINGULAR_NAME | pascal }}.value).toBe(true);
			expect(lastFetched.value).toBeInstanceOf(Date);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
			expect(isRefreshing.value).toBe(false);
		});

		test("Does not update {{ SINGULAR_NAME | kebab }} details when the request fails", async () => {
			{{ MOCK_API_NAME }}.get.mockRejectedValue(new Error("Request failed"));

			const { have{{ SINGULAR_NAME | pascal }}, isReady, lastFetched, refetch, {{ SINGULAR_NAME | camel }} } = create{{ SINGULAR_NAME | pascal }}Details();

			await expect(refetch(true)).rejects.toThrow("Request failed");

			expect({{ SINGULAR_NAME | camel }}.value).toBe(null);
			expect(have{{ SINGULAR_NAME | pascal }}.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(lastFetched.value).toBe(null);
		});
	});
});
