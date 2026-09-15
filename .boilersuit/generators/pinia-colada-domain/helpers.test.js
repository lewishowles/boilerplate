import { describe, expect, test } from "vite-plus/test";
import { format{{ SINGULAR_NAME | pascal }} } from ".";

describe("{{ SINGULAR_NAME | kebab }} item formatter", () => {
	test("Returns the item's fields unchanged when no mapping is added", () => {
		const item = {
			id: "item-123",
		};

		const formattedItem = format{{ SINGULAR_NAME | pascal }}(item);

		expect(formattedItem).toEqual(item);
	});

	test("Returns null and non-object items unchanged", () => {
		const nullItem = null;
		const textItem = "text";

		const formattedNullItem = format{{ SINGULAR_NAME | pascal }}(nullItem);
		const formattedTextItem = format{{ SINGULAR_NAME | pascal }}(textItem);

		expect(formattedNullItem).toBe(null);
		expect(formattedTextItem).toBe(textItem);
	});
});
