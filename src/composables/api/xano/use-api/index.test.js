import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import useApi from "./index";

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
		const body = { examples: [] };

		mockGet.mockResolvedValue({ getBody: () => body });

		const { get } = useApi();

		await expect(get("/examples")).resolves.toEqual(body);
		expect(mockGet).toHaveBeenCalledWith("/examples");
	});

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
