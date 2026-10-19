import { use{{ SINGULAR_NAME | pascal }}Actions } from ".";
import { {{ NAME | camel }}Domain } from "./definition.js";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

// Mock the API in this file. The mock API helper's own mock only works when it
// is imported first, and the formatter moves that import further down.
vi.mock("{{ API_IMPORT }}", async () => (await import("@lewishowles/testing/vue")).mockApiModule);

/**
 * Create {{ SINGULAR_NAME | words }} actions in a Vue app context.
 *
 * @returns  {object}
 *     The {{ SINGULAR_NAME | words }} actions.
 */
function create{{ SINGULAR_NAME | pascal }}Actions() {
	return withAppContext(() => use{{ SINGULAR_NAME | pascal }}Actions());
}

describe("{{ SINGULAR_NAME | words }} actions", () => {
	setupConsole();
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("Creates {{ SINGULAR_NAME | words }} with prepared values", async () => {
		// Values submitted to the create action.
		const parameters = { name: "Example" };
		// Response returned by the create request.
		const response = { id: "item-123" };

		{{ MOCK_API_NAME }}.post.mockResolvedValue(response);
		vi.spyOn({{ NAME | camel }}Domain, "prepare").mockReturnValue({
			name: "Prepared example",
		});

		// Create action returned by the composable.
		const { create{{ SINGULAR_NAME | pascal }} } = create{{ SINGULAR_NAME | pascal }}Actions();

		await expect(create{{ SINGULAR_NAME | pascal }}(parameters)).resolves.toEqual(response);

		expect({{ MOCK_API_NAME }}.post).toHaveBeenCalledWith("{{ ENDPOINT }}", {
			name: "Prepared example",
		});
	});

	test("Updates {{ SINGULAR_NAME | words }}", async () => {
		// Values submitted to the update action.
		const parameters = { {{ ID_NAME }}: "item-123", name: "Updated example" };
		// Response returned by the update request.
		const response = { id: "item-123" };

		{{ MOCK_API_NAME }}.patch.mockResolvedValue(response);

		// Update action returned by the composable.
		const { update{{ SINGULAR_NAME | pascal }} } = create{{ SINGULAR_NAME | pascal }}Actions();

		await expect(update{{ SINGULAR_NAME | pascal }}(parameters)).resolves.toEqual(response);

		expect({{ MOCK_API_NAME }}.patch).toHaveBeenCalledWith("{{ ENDPOINT }}/item-123", {
			name: "Updated example",
		});
	});
});
