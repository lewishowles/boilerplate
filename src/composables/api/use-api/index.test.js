import { mockLocalStorage } from "@lewishowles/testing/vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

import useApi from "./index";

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const mockResetAuthSession = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/session-reset", () => ({
	resetAuthSession: mockResetAuthSession,
}));

describe("useApi (fetch)", () => {
	describe("getFinalUrl", () => {
		test("Strips a leading slash from the endpoint", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("/examples")).toBe(`${defaultBaseUrl}/examples`);
		});

		test("Appends serialised query parameters when provided", () => {
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("examples", { page: 2 })).toBe(`${defaultBaseUrl}/examples?page=2`);
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

	describe("requests", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			mockResetAuthSession.mockResolvedValue(undefined);
			vi.stubGlobal("fetch", vi.fn());
			mockLocalStorage();
			localStorage.getItem.mockReturnValue(null);
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		test("Performs GET requests with query parameters", async () => {
			const responseBody = { examples: [] };
			const { get, isLoading, isReady } = useApi();

			fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(responseBody),
			});

			const request = get("examples", { page: 2 });

			expect(isLoading.value).toBe(true);

			await expect(request).resolves.toEqual(responseBody);

			expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples?page=2`, {
				body: undefined,
				headers: undefined,
				method: "GET",
			});
			expect(isLoading.value).toBe(false);
			expect(isReady.value).toBe(true);
		});

		test.for([
			["POST", "post", { name: "Ada" }, { "Content-Type": "application/json" }, '{"name":"Ada"}'],
			["PATCH", "patch", { name: "Ada" }, { "Content-Type": "application/json" }, '{"name":"Ada"}'],
			["DELETE", "delete", undefined, undefined, undefined],
		])(
			"Performs %s requests through the matching method",
			async ([expectedMethod, method, parameters, expectedHeaders, expectedBody]) => {
				const { [method]: request } = useApi();

				fetch.mockResolvedValue({
					ok: true,
					json: () => Promise.resolve({}),
				});

				await request("examples", parameters);

				expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples`, {
					body: expectedBody,
					headers: expectedHeaders,
					method: expectedMethod,
				});
			},
		);

		test("Adds bearer and content-type headers when a token and body are present", async () => {
			localStorage.getItem.mockReturnValue("token-123");
			const { post } = useApi();

			fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({}),
			});

			await post("examples", { name: "Ada" });

			expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples`, {
				body: '{"name":"Ada"}',
				headers: {
					Authorization: "Bearer token-123",
					"Content-Type": "application/json",
				},
				method: "POST",
			});
		});

		test("Omits headers and body when a non-GET request has no parameters", async () => {
			const { post } = useApi();

			fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({}),
			});

			await post("examples", {});

			expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples`, {
				body: undefined,
				headers: undefined,
				method: "POST",
			});
		});

		test("Throws the response body when a request is not successful", async () => {
			const responseBody = { message: "Request failed" };
			const { post, isLoading, isReady } = useApi();

			fetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve(responseBody),
			});

			await expect(post("examples", { name: "Ada" })).rejects.toEqual(responseBody);

			expect(isLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
		});

		test("Resets the auth session for an unauthorised non-login error", async () => {
			const responseBody = { code: "ERROR_CODE_UNAUTHORIZED" };
			const { get } = useApi();

			fetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve(responseBody),
			});

			await expect(get("examples")).rejects.toEqual(responseBody);
			await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
		});

		test("Keeps the auth session for an unauthorised login error", async () => {
			const responseBody = { code: "ERROR_CODE_UNAUTHORIZED" };
			const credentials = { email: "ada@example.com", password: "secret" };
			const { post } = useApi();

			fetch.mockResolvedValue({
				ok: false,
				json: () => Promise.resolve(responseBody),
			});

			await expect(post("auth/login", credentials)).rejects.toEqual(responseBody);

			expect(mockResetAuthSession).not.toHaveBeenCalled();
		});
	});
});
