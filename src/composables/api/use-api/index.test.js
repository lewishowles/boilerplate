import { describe, expect, test } from "vite-plus/test";

import useApi from "./index";

describe("useApi (fetch)", () => {
	describe("getFinalUrl", () => {
		test("Strips a leading slash from the endpoint", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("/examples")).toBe("{{ API_BASE_URL }}/examples");
		});

		test("Appends serialised query parameters when provided", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("examples", { page: 2 })).toBe("{{ API_BASE_URL }}/examples?page=2");
		});

		test("Throws when the endpoint is not a non-empty string", () => {
			const { getFinalUrl } = useApi();

			expect(() => getFinalUrl("")).toThrow();
		});
	});

	describe("getBaseUrl and setBaseUrl", () => {
		test("Updates the base URL used by subsequent requests", () => {
			const { getBaseUrl, getFinalUrl, setBaseUrl } = useApi();

			setBaseUrl("https://example.com/api");

			expect(getBaseUrl()).toBe("https://example.com/api");
			expect(getFinalUrl("examples")).toBe("https://example.com/api/examples");
		});

		test("Throws when the URL is not a non-empty string", () => {
			const { setBaseUrl } = useApi();

			expect(() => setBaseUrl("")).toThrow();
		});
	});

	describe("hasAuthToken and setAuthToken", () => {
		test("Returns false when no token is stored", () => {
			const { hasAuthToken } = useApi();

			localStorage.getItem.mockReturnValue(null);

			expect(hasAuthToken()).toBe(false);
		});

		test("Returns true when a token is stored", () => {
			const { hasAuthToken } = useApi();

			localStorage.getItem.mockReturnValue("token-123");

			expect(hasAuthToken()).toBe(true);
		});

		test("Stores the auth token", () => {
			const { setAuthToken } = useApi();

			setAuthToken("token-123");

			expect(localStorage.setItem).toHaveBeenCalledWith("authToken", "token-123");
		});

		test("Removes the auth token when set to null", () => {
			const { setAuthToken } = useApi();

			setAuthToken(null);

			expect(localStorage.removeItem).toHaveBeenCalledWith("authToken");
		});
	});
});
