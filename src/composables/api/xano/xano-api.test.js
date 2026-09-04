import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import createXanoApi from "./xano-api";

// Mock used to observe Xano GET requests.
const mockGet = vi.hoisted(() => vi.fn());
// Mock used to observe Xano auth-token reads.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mock used to observe automatic auth-session resets.
const mockResetAuthSession = vi.hoisted(() => vi.fn());
// Mock used to observe Xano auth-token writes.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

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

	test("Unwraps the response body from a Xano request error", async () => {
		// Failed Xano response body.
		const body = { message: "Request failed" };

		mockGet.mockRejectedValue({
			/**
			 * Provide the Xano error response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano error response.
			 */
			getResponse: () => ({
				/**
				 * Provide the Xano error body stub.
				 *
				 * @returns  {object}
				 *     The stubbed Xano response body.
				 */
				getBody: () => body,
			}),
		});

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("widgets")).rejects.toEqual(body);
		expect(api.isReady.value).toBe(false);
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

		mockGet.mockRejectedValue(body);

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("widgets")).rejects.toEqual(body);
		await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
	});

	test("Keeps the auth session for an unauthorised login error", async () => {
		// Unauthorised Xano response body.
		const body = { code: "ERROR_CODE_UNAUTHORIZED" };

		mockGet.mockRejectedValue(body);

		// Xano API adapter under test.
		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("auth/login")).rejects.toEqual(body);

		expect(mockResetAuthSession).not.toHaveBeenCalled();
	});
});
