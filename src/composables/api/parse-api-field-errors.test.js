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
		// Parsed error returned by the helper.
		const response = parseApiFieldErrors({ message: "Something went wrong" });

		expect(response).toEqual({ _error: "Something went wrong" });
	});

	test("Returns a field error for an input error with a field name", () => {
		// Parsed error returned by the helper.
		const response = parseApiFieldErrors({
			code: "ERROR_CODE_INPUT_ERROR",
			message: "Enter a valid email address",
			payload: { param: "email" },
		});

		expect(response).toEqual({ email: "Enter a valid email address" });
	});

	test("Returns a general error when the field name is unusable", () => {
		// Parsed error returned by the helper.
		const response = parseApiFieldErrors({
			code: "ERROR_CODE_INPUT_ERROR",
			message: "Something went wrong",
			payload: { param: "" },
		});

		expect(response).toEqual({ _error: "Something went wrong" });
	});

	test("Returns a general error when a field name has an unknown error code", () => {
		// Parsed error returned by the helper.
		const response = parseApiFieldErrors({
			code: "ERROR_CODE_UNAUTHORIZED",
			message: "Something went wrong",
			payload: { param: "email" },
		});

		expect(response).toEqual({ _error: "Something went wrong" });
	});
});
