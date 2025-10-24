import { describe, expect, test } from "vitest";
import {{CAMEL_CASE_NAME}} from "./{{COMPOSABLE_NAME}}.js";

describe("{{COMPOSABLE_NAME}}", () => {
	test("A composable should exist", () => {
		const response = {{CAMEL_CASE_NAME}}();

		expect(response).toBeTypeOf("object");
	});

	test("", () => {
		const { returned } = {{CAMEL_CASE_NAME}}();
	});
});
