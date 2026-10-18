import { format{{ SINGULAR_NAME | pascal }} } from ".";
import { describe, expect, test } from "vite-plus/test";

describe("{{ SINGULAR_NAME | words }} formatter", () => {
	test("Adds an empty derived object to a record", () => {
		// The record returned by the API.
		const record = { id: "item-123" };
		// The record after formatting.
		const formattedRecord = format{{ SINGULAR_NAME | pascal }}(record);

		expect(formattedRecord).toEqual({ id: "item-123", derived: {} });
	});

	test("Copies a record without changing the API data", () => {
		// The record returned by the API.
		const record = { id: "item-123", name: "Flight 123" };
		// The record after formatting.
		const formattedRecord = format{{ SINGULAR_NAME | pascal }}(record);

		expect(formattedRecord).not.toBe(record);
		expect(record).toEqual({ id: "item-123", name: "Flight 123" });
	});

	test("Returns null and other non-object values unchanged", () => {
		// A null value, which the formatter returns unchanged.
		const nullValue = null;
		// A text value, which the formatter returns unchanged.
		const textValue = "text";
		// The formatted null value.
		const formattedNullValue = format{{ SINGULAR_NAME | pascal }}(nullValue);
		// The formatted text value.
		const formattedTextValue = format{{ SINGULAR_NAME | pascal }}(textValue);

		expect(formattedNullValue).toBe(null);
		expect(formattedTextValue).toBe(textValue);
	});
});
