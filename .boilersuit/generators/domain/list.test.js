import { {{ NAME | constant }}_KEYS, use{{ NAME | pascal }} } from ".";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

// Mock the API composable in this file so Vitest sets the mock up before any import.
// The mock API helper also mocks it, but only in time when it is imported before the
// code under test, and the formatter sorts that import later.
vi.mock("{{ API_IMPORT }}", async () => (await import("@lewishowles/testing/vue")).mockApiModule);

/**
 * Create the {{ NAME | words }} list query wrapper in a Vue app context.
 *
 * @returns  {object}
 *     The {{ NAME | words }} query state and actions.
 */
function create{{ NAME | pascal }}() {
	return withAppContext(() => use{{ NAME | pascal }}());
}

describe("{{ NAME | words }} list", () => {
	setupConsole();

	// Response returned by the list request.
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
		test("Loads and stores {{ NAME | words }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			// Query state returned after the response loads.
			const { have{{ NAME | pascal }}, refetch, {{ NAME | camel }}, totalRows } = create{{ NAME | pascal }}();

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}", undefined);
			expect({{ NAME | camel }}.value).toEqual([{ ...validResponse.items[0], derived: {} }]);
			expect(have{{ NAME | pascal }}.value).toBe(true);
			expect(totalRows.value).toBe(0);
		});
	});
});
