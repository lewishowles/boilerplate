{{ set COMPOSABLE_NAME = NAME | pascal }}
import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import {{ MOCK_API_NAME }} from "{{ MOCK_API_IMPORT }}";

import { use{{ COMPOSABLE_NAME }}Actions } from ".";

/**
 * Create the {{ NAME | kebab }} actions in a Vue app context.
 */
function create{{ COMPOSABLE_NAME }}Actions() {
	return withAppContext(() => use{{ COMPOSABLE_NAME }}Actions());
}

describe("{{ NAME | kebab }} actions", () => {
	setupConsole();

	test("Creates {{ NAME | kebab }}", async () => {
		const parameters = {
			name: "Example",
		};
		const response = {
			id: "item-123",
		};
		{{ MOCK_API_NAME }}.post.mockResolvedValue(response);

		const { create{{ COMPOSABLE_NAME }} } = create{{ COMPOSABLE_NAME }}Actions();

		await expect(create{{ COMPOSABLE_NAME }}(parameters)).resolves.toEqual(response);
		expect({{ MOCK_API_NAME }}.post).toHaveBeenCalledWith("{{ ENDPOINT }}", parameters);
	});

	test("Updates {{ NAME | kebab }}", async () => {
		const parameters = {
			{{ ID_NAME }}: "item-123",
			name: "Updated example",
		};
		const response = {
			id: "item-123",
		};
		{{ MOCK_API_NAME }}.patch.mockResolvedValue(response);

		const { update{{ COMPOSABLE_NAME }} } = create{{ COMPOSABLE_NAME }}Actions();

		await expect(update{{ COMPOSABLE_NAME }}(parameters)).resolves.toEqual(response);
		expect({{ MOCK_API_NAME }}.patch).toHaveBeenCalledWith("{{ ENDPOINT }}/item-123", {
			name: "Updated example",
		});
	});
});
