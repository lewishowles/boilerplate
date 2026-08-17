import { describe, expect, test } from "vite-plus/test";
import { format{{ NAME | pascal }}Response } from ".";

describe("{{ NAME | kebab }} response formatter", () => {
	test("Unwraps a response data envelope", () => {
		const response = {
			data: {
				id: "item-123",
			},
		};

		const formattedResponse = format{{ NAME | pascal }}Response(response);

		expect(formattedResponse).toEqual(response.data);
	});

	test("Preserves an envelope-level item total", () => {
		const response = {
			data: {
				items: [{ id: "item-123" }],
			},
			itemsTotal: 42,
		};

		const formattedResponse = format{{ NAME | pascal }}Response(response);

		expect(formattedResponse).toEqual({
			items: response.data.items,
			itemsTotal: 42,
		});
	});

	test("Returns null and non-object responses unchanged", () => {
		const nullResponse = null;
		const textResponse = "response";

		const formattedNullResponse = format{{ NAME | pascal }}Response(nullResponse);
		const formattedTextResponse = format{{ NAME | pascal }}Response(textResponse);

		expect(formattedNullResponse).toBe(null);
		expect(formattedTextResponse).toBe(textResponse);
	});
});
