import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import useApi from "./index";

// Mock used to observe Xano GET requests.
const mockGet = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/xano/xano-client", () => ({
	xano: {
		get: mockGet,
	},
}));

describe("useApi (Xano)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Delegates requests to the configured Xano API-group client", async () => {
		// Response body returned by the Xano client stub.
		const body = { examples: [] };

		mockGet.mockResolvedValue({
			/**
			 * Provide the Xano response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano response body.
			 */
			getBody: () => body,
		});

		// Xano GET method under test.
		const { get } = useApi();

		await expect(get("/examples")).resolves.toEqual(body);
		expect(mockGet).toHaveBeenCalledWith("/examples");
	});

	describe("getFinalUrl", () => {
		test("Strips a leading slash from the endpoint", () => {
			// URL builder under test.
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("/examples")).toBe("/examples");
		});

		test("Throws when the endpoint is not a non-empty string", () => {
			// URL builder under test.
			const { getFinalUrl } = useApi();

			expect(() => getFinalUrl("")).toThrow();
		});
	});

	describe("isUnauthorisedError", () => {
		test("Returns true when the error body's code matches the unauthorised code", () => {
			// Auth-error checker under test.
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({ code: "ERROR_CODE_UNAUTHORIZED" })).toBe(true);
		});

		test("Returns false when the error body's code does not match", () => {
			// Auth-error checker under test.
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({ code: "ERROR_CODE_NOT_FOUND" })).toBe(false);
		});

		test("Returns false when the error body has no code", () => {
			// Auth-error checker under test.
			const { isUnauthorisedError } = useApi();

			expect(isUnauthorisedError({})).toBe(false);
		});
	});
});
