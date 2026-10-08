import { describe, expect, test } from "vite-plus/test";
import { format{{ SINGULAR_NAME | pascal }} } from ".";

describe("{{ NAME | kebab }} response formatter", () => {
	test("Unwraps a response data envelope", () => {
		// Response containing a data envelope.
		const response = {
			data: {
				id: "item-123",
			},
		};

		// Response after the data envelope is removed.
		const formattedResponse = format{{ SINGULAR_NAME | pascal }}(response);

		expect(formattedResponse).toEqual(response.data);
	});

	test("Preserves an envelope-level item total", () => {
		// Response containing list data and an envelope-level total.
		const response = {
			data: {
				items: [{ id: "item-123" }],
			},
			itemsTotal: 42,
		};

		// Response after the data is normalised.
		const formattedResponse = format{{ SINGULAR_NAME | pascal }}(response);

		expect(formattedResponse).toEqual({
			items: response.data.items,
			itemsTotal: 42,
		});
	});

	test("Returns null and non-object responses unchanged", () => {
		// Non-object values that should remain unchanged.
		const nullResponse = null;
		const textResponse = "response";
		// Formatted null response.
		const formattedNullResponse = format{{ SINGULAR_NAME | pascal }}(nullResponse);
		// Formatted text response.
		const formattedTextResponse = format{{ SINGULAR_NAME | pascal }}(textResponse);

		expect(formattedNullResponse).toBe(null);
		expect(formattedTextResponse).toBe(textResponse);
	});
});
