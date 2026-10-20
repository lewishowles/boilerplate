import { {{ NAME | constant }}_KEYS, use{{ SINGULAR_NAME | pascal }} } from ".";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

// Declare the API mock in this file, where Vitest runs it before the imports,
// so it applies whatever order the imports are in.
vi.mock("{{ API_IMPORT }}", async () => (await import("@lewishowles/testing/vue")).mockApiModule);

/**
 * Create the {{ SINGULAR_NAME | words }} query wrapper in a Vue app context.
 *
 * @param  {string|null}  {{ ID_NAME }}
 *     The {{ SINGULAR_NAME | words }} ID to pass to the query wrapper.
 *
 * @returns  {object}
 *     The {{ SINGULAR_NAME | words }} query state and actions.
 */
function create{{ SINGULAR_NAME | pascal }}({{ ID_NAME }} = "item-123") {
	return withAppContext(() => use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }}));
}

describe("{{ SINGULAR_NAME | words }} details", () => {
	setupConsole();

	// Response returned by the details request.
	const sampleResponse = {
		id: "item-123",
	};

	describe("{{ NAME | constant }}_KEYS", () => {
		test("Creates a stable record key", () => {
			expect({{ NAME | constant }}_KEYS.byId("item-123")).toEqual(["{{ NAME | kebab }}", "item-123"]);
		});
	});

	describe("use{{ SINGULAR_NAME | pascal }}", () => {
		test("Loads and stores {{ SINGULAR_NAME | words }} details", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(sampleResponse);

			// The record's details query, which has not fetched anything yet.
			const query = create{{ SINGULAR_NAME | pascal }}();

			expect(query.lastFetched.value).toBe(null);

			await query.refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}/item-123");
			expect(query.{{ SINGULAR_NAME | camel }}.value).toEqual({ ...sampleResponse, derived: {} });
			expect(query.have{{ SINGULAR_NAME | pascal }}.value).toBe(true);
			expect(query.lastFetched.value).toBeInstanceOf(Date);
			expect(query.isInitialLoading.value).toBe(false);
			expect(query.isReady.value).toBe(true);
			expect(query.isRefreshing.value).toBe(false);
		});
	});
});
