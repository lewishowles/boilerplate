import { describe, expect, test } from "vite-plus/test";

import useApi from "./index";

describe("useApi (Xano)", () => {
	describe("getFinalUrl", () => {
		test("Strips a leading slash from the endpoint", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("/examples")).toBe("/examples");
		});

		test("Appends serialised query parameters when provided", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("examples", { page: 2 })).toBe("/examples?page=2");
		});

		test("Throws when the endpoint is not a non-empty string", () => {
			const { getFinalUrl } = useApi();

			expect(() => getFinalUrl("")).toThrow();
		});
	});

	describe("isUnauthorisedError", () => {
		test("Returns true when the error body's code matches the unauthorised code", () => {
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({ code: "ERROR_CODE_UNAUTHORIZED" })).toBe(true);
		});

		test("Returns false when the error body's code does not match", () => {
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({ code: "ERROR_CODE_NOT_FOUND" })).toBe(false);
		});

		test("Returns false when the error body has no code", () => {
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({})).toBe(false);
		});
	});
});
