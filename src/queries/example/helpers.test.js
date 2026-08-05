import { describe, expect, test } from "vite-plus/test";

import { shapeExampleResponse } from ".";

describe("example response helper", () => {
	test("Unwraps a response data envelope", () => {
		const response = {
			data: {
				id: "item-123",
			},
		};

		const shapedResponse = shapeExampleResponse(response);

		expect(shapedResponse).toEqual(response.data);
	});

	test("Returns null and non-object responses unchanged", () => {
		const nullResponse = null;
		const textResponse = "response";

		const shapedNullResponse = shapeExampleResponse(nullResponse);
		const shapedTextResponse = shapeExampleResponse(textResponse);

		expect(shapedNullResponse).toBe(null);
		expect(shapedTextResponse).toBe(textResponse);
	});
});
