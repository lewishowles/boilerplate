import { describe, expect, test } from "vite-plus/test";

import ApiError from "./api-error";

describe("ApiError", () => {
	test("Copies the server code and message without changing its body", () => {
		// Server body with a status that must remain separate from the HTTP
		// status.
		const body = { code: "ERROR_TEST", message: "Request failed", status: "body value" };
		// Error exposed to API callers.
		const error = new ApiError(422, body);

		expect(error).toBeInstanceOf(Error);
		expect(error).toMatchObject({
			code: body.code,
			message: body.message,
			name: "ApiError",
			status: 422,
		});
		expect(error.body).toBe(body);
		expect(body.status).toBe("body value");
	});

	test.for([
		["missing", { code: "ERROR_TEST" }],
		["empty", { code: "ERROR_TEST", message: "" }],
	])("Leaves the message empty when the server message is %s", ([, body]) => {
		// Error exposed to API callers.
		const error = new ApiError(undefined, body);

		expect(error.message).toBe("");
		expect(error.status).toBeUndefined();
	});

	test("Keeps a string body without adding a code or message", () => {
		// Error exposed to API callers.
		const error = new ApiError(503, "Service unavailable");

		expect(error.status).toBe(503);
		expect(error.body).toBe("Service unavailable");
		expect(error).not.toHaveProperty("code");
		expect(error.message).toBe("");
	});
});
