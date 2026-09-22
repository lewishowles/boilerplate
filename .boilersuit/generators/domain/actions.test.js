import { describe, expect, test } from "vite-plus/test";
import { setupConsole } from "@lewishowles/testing/vitest";
import { withAppContext } from "@lewishowles/testing/vue";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { use{{ SINGULAR_NAME | pascal }}Actions } from ".";

/**
 * Create {{ SINGULAR_NAME | kebab }} actions in a Vue app context.
 *
 * @returns  {object}
 *     The {{ SINGULAR_NAME | kebab }} actions.
 */
function create{{ SINGULAR_NAME | pascal }}Actions() {
	return withAppContext(() => use{{ SINGULAR_NAME | pascal }}Actions());
}

describe("{{ SINGULAR_NAME | kebab }} actions", () => {
	setupConsole();

	test("Creates {{ SINGULAR_NAME | kebab }}", async () => {
		// Values submitted to the create action.
		const parameters = { name: "Example" };
		// Response returned by the create request.
		const response = { id: "item-123" };

		{{ MOCK_API_NAME }}.post.mockResolvedValue(response);

		// Create action returned by the composable.
		const { create{{ SINGULAR_NAME | pascal }} } = create{{ SINGULAR_NAME | pascal }}Actions();

		await expect(create{{ SINGULAR_NAME | pascal }}(parameters)).resolves.toEqual(response);
		expect({{ MOCK_API_NAME }}.post).toHaveBeenCalledWith("{{ ENDPOINT }}", parameters);
	});

	test("Updates {{ SINGULAR_NAME | kebab }}", async () => {
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
