import { describe, expect, test } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import mockApi from "@test/unit/support/mock-api";

import { useExampleActions } from ".";

/**
 * Create the example actions in a Vue app context.
 */
function createExampleActions() {
	return withAppContext(() => useExampleActions());
}

describe("example actions", () => {
	setupConsole();

	test("Creates example", async () => {
		const parameters = {
			name: "Example",
		};

		const response = {
			id: "item-123",
		};

		mockApi.post.mockResolvedValue(response);

		const { createExample } = createExampleActions();

		await expect(createExample(parameters)).resolves.toEqual(response);
		expect(mockApi.post).toHaveBeenCalledWith("examples", parameters);
	});

	test("Updates example", async () => {
		const parameters = {
			id: "item-123",
			name: "Updated example",
		};

		const response = {
			id: "item-123",
		};

		mockApi.patch.mockResolvedValue(response);

		const { updateExample } = createExampleActions();

		await expect(updateExample(parameters)).resolves.toEqual(response);
		expect(mockApi.patch).toHaveBeenCalledWith("examples/item-123", {
			name: "Updated example",
		});
	});
});
