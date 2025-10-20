import { describe, expect, test } from "vitest";
import {{CAMEL_CASE_NAME}} from "./{{COMPOSABLE_NAME}}.js";

describe("{{COMPOSABLE_NAME}}", () => {
	test("should initialise", () => {
		const response = {{CAMEL_CASE_NAME}}();

		expect(response).toBeTypeOf("object");
	});

	test("should ", () => {
		const { returned } = {{CAMEL_CASE_NAME}}();
	});
});
