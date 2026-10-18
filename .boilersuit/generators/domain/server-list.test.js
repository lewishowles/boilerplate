import { {{ NAME | constant }}_KEYS, use{{ NAME | pascal }} } from ".";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

// Mock the API in this file. The mock API helper's own mock only works when it
// is imported first, and the formatter moves that import further down.
vi.mock("{{ API_IMPORT }}", async () => (await import("@lewishowles/testing/vue")).mockApiModule);

/**
 * Create the {{ NAME | words }} list query wrapper in a Vue app context.
 *
 * @param  {object}  parameters
 *     Query parameters for the {{ NAME | words }} list.
 *
 * @returns  {object}
 *     The {{ NAME | words }} query state and actions.
 */
function create{{ NAME | pascal }}(parameters) {
	return withAppContext(() => use{{ NAME | pascal }}(parameters));
}

describe("{{ NAME | words }} list", () => {
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
		test("Loads and stores {{ NAME | words }}", async () => {
			{{ MOCK_API_NAME }}.get.mockResolvedValue(validResponse);

			// Query state returned after the response loads.
			const { have{{ NAME | pascal }}, refetch, {{ NAME | camel }}, totalRows } = create{{ NAME | pascal }}(parameters);

			await refetch(true);

			expect({{ MOCK_API_NAME }}.get).toHaveBeenCalledWith("{{ ENDPOINT }}", parameters);
			expect({{ NAME | camel }}.value).toEqual([{ ...validResponse.items[0], derived: {} }]);
			expect(totalRows.value).toBe(validResponse.itemsTotal);
			expect(have{{ NAME | pascal }}.value).toBe(true);
		});
	});
});
