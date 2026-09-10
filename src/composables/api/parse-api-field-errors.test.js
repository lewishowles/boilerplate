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
	])("Falls back to a general apology for an error we cannot use: %s", ([, error]) => {
		expect(parseApiFieldErrors(error)).toEqual({
			_error:
				"Sorry, we couldn't complete that. Please try again later, or contact support if it keeps happening.",
		});
	});

	// The exact body Xano returns on a 403, which is the response that produced
	// an uncaught rejection before this fallback existed.
	test("Falls back to a general apology for an error with a code but no message", () => {
		// Parsed error returned by the helper.
		const response = parseApiFieldErrors({ code: "ERROR_CODE_ACCESS_DENIED", message: "" });

		expect(response).toEqual({
			_error:
				"Sorry, we couldn't complete that. Please try again later, or contact support if it keeps happening.",
		});
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
