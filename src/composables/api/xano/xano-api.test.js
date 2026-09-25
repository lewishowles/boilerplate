import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import ApiError from "../api-error";
import createXanoApi from "./xano-api";

// Mock used to observe Xano GET requests.
const mockGet = vi.hoisted(() => vi.fn());
// Mock used to observe Xano auth-token reads.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mock used to observe automatic auth-session resets.
const mockResetAuthSession = vi.hoisted(() => vi.fn());
// Mock used to observe Xano auth-token writes.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

/**
 * Build the error the Xano client rejects with for a failed request, with the
 * server body and an optional HTTP status.
 *
 * @param  {*}  body
 *     The server body returned with the failed request.
 * @param  {number|undefined}  status
 *     The HTTP status, or undefined when the response has no status getter.
 *
 * @returns  {object}
 *     The error the Xano client mock rejects with.
 */
function createXanoRequestError(body, status) {
	// The failed server response exposed by the Xano error.
	const response = {
		/**
		 * Provide the server body for the adapter.
		 *
		 * @returns  {*}
		 *     The original server body.
		 */
		getBody: () => body,
	};

	if (status !== undefined) {
		/**
		 * Provide the HTTP status when the response exposes one.
		 *
		 * @returns  {number}
		 *     The HTTP status of the failed request.
		 */
		response.getStatusCode = () => status;
	}

	return {
		/**
		 * Provide the failed response to the adapter.
		 *
		 * @returns  {object}
		 *     The response with its body and optional status getter.
		 */
		getResponse: () => response,
	};
}

vi.mock("@/composables/api/session-reset", () => ({
	resetAuthSession: mockResetAuthSession,
}));

describe("createXanoApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockResetAuthSession.mockResolvedValue(undefined);
	});

	test("Returns the response body from a successful request", async () => {
		// Successful Xano response body.
		const body = { widgets: [] };

		mockGet.mockResolvedValue({
			/**
			 * Provide the Xano response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano response body.
			 */
			getBody: () => body,
		});

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("widgets")).resolves.toEqual(body);
		expect(api.isReady.value).toBe(true);
	});

	test("Throws an API error with the status and body from a Xano request error", async () => {
		// Failed Xano response body.
		const body = { message: "Request failed" };

		mockGet.mockRejectedValue(createXanoRequestError(body, 422));

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		// Error thrown to the request caller.
		const error = await api.get("widgets").catch((failure) => failure);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(422);
		expect(error.body).toBe(body);
		expect(api.isReady.value).toBe(false);
	});

	test("Leaves the status undefined when a Xano error response has no status getter", async () => {
		// Failed Xano response body.
		const body = { message: "Request failed" };
		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		mockGet.mockRejectedValue(createXanoRequestError(body));

		// Error thrown to the request caller.
		const error = await api.get("widgets").catch((failure) => failure);

		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBeUndefined();
		expect(error.body).toBe(body);
	});

	test("Rethrows a network error unchanged", async () => {
		// Network failure that has no Xano response.
		const networkError = new Error("Connection failed");
		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		mockGet.mockRejectedValue(networkError);

		await expect(api.get("widgets")).rejects.toBe(networkError);
	});

	test("Delegates token storage to the shared Xano client", () => {
		mockHasAuthToken.mockReturnValue(true);

		// Xano API adapter under test.
		const api = createXanoApi({
			client: {
				get: mockGet,
				hasAuthToken: mockHasAuthToken,
				setAuthToken: mockSetAuthToken,
			},
		});

		expect(api.hasAuthToken()).toBe(true);

		api.setAuthToken("token-123");

		expect(mockSetAuthToken).toHaveBeenCalledWith("token-123");
	});

	test("Resets the auth session for an unauthorised non-login error", async () => {
		// Unauthorised Xano response body.
		const body = { code: "ERROR_CODE_UNAUTHORIZED" };

		mockGet.mockRejectedValue(createXanoRequestError(body, 401));

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("widgets")).rejects.toMatchObject({
			body,
			code: body.code,
			status: 401,
		});
		await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
	});

	test("Keeps the auth session for an unauthorised login error", async () => {
		// Unauthorised Xano response body.
		const body = { code: "ERROR_CODE_UNAUTHORIZED" };

		mockGet.mockRejectedValue(createXanoRequestError(body, 401));

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("auth/login")).rejects.toMatchObject({
			body,
			code: body.code,
			status: 401,
		});

		expect(mockResetAuthSession).not.toHaveBeenCalled();
	});
});
