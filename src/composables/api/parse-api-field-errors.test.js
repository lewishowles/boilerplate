import { describe, expect, test } from "vite-plus/test";
import { parseApiFieldErrors } from "./parse-api-field-errors";

describe("parseApiFieldErrors", () => {
	test.for([
		["boolean (true)", true],
		["boolean (false)", false],
		["string (empty)", ""],
		["object (empty)", {}],
		["null", null],
		["undefined", undefined],
	])("Rejects invalid error: %s", ([, error]) => {
		expect(parseApiFieldErrors(error)).toBeNull();
	});

	test("Returns a general error for a message with no identifiable field", () => {
		const response = parseApiFieldErrors({ message: "Something went wrong" });

		expect(response).toEqual({ _error: "Something went wrong" });
	});
});
