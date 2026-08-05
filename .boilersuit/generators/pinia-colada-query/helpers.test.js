{{ set COMPOSABLE_NAME = NAME | pascal }}
import { describe, expect, test } from "vite-plus/test";

import { shape{{ COMPOSABLE_NAME }}Response } from ".";

describe("{{ NAME | kebab }} response helper", () => {
	test("Unwraps a response data envelope", () => {
		const response = {
			data: {
				id: "item-123",
			},
		};

		const shapedResponse = shape{{ COMPOSABLE_NAME }}Response(response);

		expect(shapedResponse).toEqual(response.data);
	});

	test("Preserves an envelope-level item total", () => {
		const response = {
			data: {
				items: [{ id: "item-123" }],
			},
			itemsTotal: 42,
		};

		const shapedResponse = shape{{ COMPOSABLE_NAME }}Response(response);

		expect(shapedResponse).toEqual({
			items: response.data.items,
			itemsTotal: 42,
		});
	});

	test("Returns null and non-object responses unchanged", () => {
		const nullResponse = null;
		const textResponse = "response";

		const shapedNullResponse = shape{{ COMPOSABLE_NAME }}Response(nullResponse);
		const shapedTextResponse = shape{{ COMPOSABLE_NAME }}Response(textResponse);

		expect(shapedNullResponse).toBe(null);
		expect(shapedTextResponse).toBe(textResponse);
	});
});
