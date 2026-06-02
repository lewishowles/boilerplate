import { describe, expect, test } from "vite-plus/test";
import {{NAME | camel}} from "./{{NAME | kebab}}.js";

describe("{{NAME | kebab}}", () => {
	test("A composable should exist", () => {
		const response = {{NAME | camel}}();

		expect(response).toBeTypeOf("object");
	});
});
