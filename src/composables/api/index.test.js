import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick } from "vue";

import ApiError from "./api-error";

// API base URL used in request URL expectations.
const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
// Key used by the composable to store the auth token.
const authTokenStorageKey = "authToken";
// A real Storage that replaces the mocked localStorage from the global test
// setup. It is installed before useApi is imported, so the saved auth token is
// read from and written to it.
const authStorage = new Storage();
// Mock used to observe automatic auth-session resets.
const mockResetAuthSession = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/session-reset", () => ({
	resetAuthSession: mockResetAuthSession,
}));

vi.stubGlobal("localStorage", authStorage);

// API methods loaded after the storage global is installed.
const { default: useApi } = await import("./index");

describe("useApi (fetch)", () => {
	beforeEach(() => {
		useApi().setAuthToken(null);
		vi.clearAllMocks();
	});

	describe("getFinalUrl", () => {
		test("Strips a leading slash from the endpoint", () => {
			// URL builder under test.
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("/examples")).toBe(`${defaultBaseUrl}/examples`);
		});

		test("Appends serialised query parameters when provided", () => {
			// URL builder under test.
			const { getFinalUrl } = useApi();

			expect(getFinalUrl("examples", { page: 2 })).toBe(`${defaultBaseUrl}/examples?page=2`);
		});

		test("Throws when the endpoint is not a non-empty string", () => {
			// URL builder under test.
			const { getFinalUrl } = useApi();

			expect(() => getFinalUrl("")).toThrow();
		});
	});

	describe("getBaseUrl and setBaseUrl", () => {
		test("Updates the base URL used by subsequent requests", () => {
			// Base URL methods under test.
			const { getBaseUrl, getFinalUrl, setBaseUrl } = useApi();

			setBaseUrl("https://example.com/api");

			expect(getBaseUrl()).toBe("https://example.com/api");
			expect(getFinalUrl("examples")).toBe("https://example.com/api/examples");
		});

		test("Throws when the URL is not a non-empty string", () => {
			// Base URL setter under test.
			const { setBaseUrl } = useApi();

			expect(() => setBaseUrl("")).toThrow();
		});
	});

	describe("hasAuthToken and setAuthToken", () => {
		test("Returns false when no token is stored", () => {
			// Auth token reader under test.
			const { hasAuthToken } = useApi();

			expect(hasAuthToken()).toBe(false);
		});

		test("Returns true after storing a token", () => {
			// Auth token reader and writer under test.
			const { hasAuthToken, setAuthToken } = useApi();

			setAuthToken("token-123");

			expect(hasAuthToken()).toBe(true);
			expect(authStorage.getItem(authTokenStorageKey)).toBe("token-123");
		});

		test("Clears the auth token when set to null", async () => {
			// Auth token reader and writer under test.
			const { hasAuthToken, setAuthToken } = useApi();

			setAuthToken("token-123");

			// The happy-dom test environment fires the storage event for our
			// own write in this window, which makes VueUse ignore changes until
			// the next tick. Browsers only fire it in other tabs, so the app is
			// unaffected.
			await nextTick();

			setAuthToken(null);

			expect(hasAuthToken()).toBe(false);
			expect(authStorage.getItem(authTokenStorageKey)).toBeNull();
		});
	});

	describe("requests", () => {
		beforeEach(() => {
			mockResetAuthSession.mockResolvedValue(undefined);
			vi.stubGlobal("fetch", vi.fn());
		});

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		test("Performs GET requests with query parameters", async () => {
			// Successful response body returned by the fetch mock.
			const responseBody = { examples: [] };
			// API methods and state under test.
			const { get, isLoading, isReady } = useApi();

			fetch.mockResolvedValue(new Response(JSON.stringify(responseBody)));

			// Pending request used to observe loading state.
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
				// API method selected for the current request case.
				const { [method]: request } = useApi();

				fetch.mockResolvedValue(new Response("{}"));

				await request("examples", parameters);

				expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples`, {
					body: expectedBody,
					headers: expectedHeaders,
					method: expectedMethod,
				});
			},
		);

		test("Adds bearer and content-type headers when a token and body are present", async () => {
			// POST method used to add auth headers.
			const { post, setAuthToken } = useApi();

			setAuthToken("token-123");

			fetch.mockResolvedValue(new Response("{}"));

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
			// POST method used for the empty request.
			const { post } = useApi();

			fetch.mockResolvedValue(new Response("{}"));

			await post("examples", {});

			expect(fetch).toHaveBeenCalledWith(`${defaultBaseUrl}/examples`, {
				body: undefined,
				headers: undefined,
				method: "POST",
			});
		});

		test("Throws an API error with the status and body when a request fails", async () => {
			// Failed response body returned by the fetch mock.
			const responseBody = { message: "Request failed" };
			// API methods and state under test.
			const { post, isLoading, isReady } = useApi();

			fetch.mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 422 }));

			// Error thrown to the request caller.
			const error = await post("examples", { name: "Ada" }).catch((failure) => failure);

			expect(error).toBeInstanceOf(ApiError);
			expect(error.status).toBe(422);
			expect(error.body).toEqual(responseBody);
			expect(isLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
		});

		test("Keeps the status and text of a non-JSON error response", async () => {
			// Server error body that cannot be parsed as JSON.
			const responseBody = "<html>Bad gateway</html>";
			// GET method used for the failed request.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response(responseBody, { status: 502 }));

			await expect(get("examples")).rejects.toMatchObject({
				body: responseBody,
				status: 502,
			});
		});

		test("Uses an undefined body for an empty error response", async () => {
			// GET method used for the failed request.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response(null, { status: 500 }));

			// Error returned to the caller for the empty response.
			const error = await get("examples").catch((failure) => failure);

			expect(error).toBeInstanceOf(ApiError);
			expect(error.status).toBe(500);
			expect(error.body).toBeUndefined();
		});

		test("Resolves with undefined for a successful empty response", async () => {
			// GET method used for the empty response.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response(null, { status: 204 }));

			await expect(get("examples")).resolves.toBeUndefined();
		});

		test("Rethrows a network error unchanged", async () => {
			// Network failure that has no server response.
			const networkError = new Error("Connection failed");
			// GET method used for the failing request.
			const { get } = useApi();

			fetch.mockRejectedValue(networkError);

			await expect(get("examples")).rejects.toBe(networkError);
		});

		test("Resets the auth session for an unauthorised non-login error", async () => {
			// Unauthorised response body returned by the fetch mock.
			const responseBody = { code: "ERROR_CODE_UNAUTHORIZED" };
			// GET method used to trigger the session reset.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 401 }));

			await expect(get("examples")).rejects.toMatchObject({
				body: responseBody,
				code: responseBody.code,
				status: 401,
			});

			await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
		});

		test("Resets the auth session for a JSON 401 without an error code", async () => {
			// Unauthorised response body without the usual error code.
			const responseBody = { message: "Session expired" };
			// GET method used to trigger the session reset.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 401 }));

			await expect(get("examples")).rejects.toMatchObject({
				body: responseBody,
				status: 401,
			});

			await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
		});

		test("Resets the auth session for a non-JSON 401 response", async () => {
			// GET method used to trigger the session reset.
			const { get } = useApi();

			fetch.mockResolvedValue(new Response("Unauthorised", { status: 401 }));

			await expect(get("examples")).rejects.toMatchObject({
				body: "Unauthorised",
				status: 401,
			});

			await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
		});

		test("Keeps the auth session for an unauthorised login error", async () => {
			// Unauthorised response body returned by the fetch mock.
			const responseBody = { code: "ERROR_CODE_UNAUTHORIZED" };
			// Login details that keep the auth session intact.
			const credentials = { email: "ada@example.com", password: "secret" };
			// POST method used for the login request.
			const { post } = useApi();

			fetch.mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 401 }));

			await expect(post("auth/login", credentials)).rejects.toMatchObject({
				body: responseBody,
				code: responseBody.code,
				status: 401,
			});

			expect(mockResetAuthSession).not.toHaveBeenCalled();
		});
	});
});
