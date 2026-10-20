import { apiErrorCodes, apiErrorReasons } from "@/constants/api.js";
import { withAppContext } from "@lewishowles/testing/vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

// Mocked auth API GET method.
const mockGet = vi.hoisted(() => vi.fn());
// Mocked auth-token lookup method.
const mockHasAuthToken = vi.hoisted(() => vi.fn(() => false));
// Mocked auth API POST method.
const mockPost = vi.hoisted(() => vi.fn());
// Mocked auth-session reset action.
const mockResetAuthSession = vi.hoisted(() => vi.fn());
// Mocked auth-token storage action.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-auth-api", () => ({
	/**
	 * Return mocked auth API methods.
	 *
	 * @returns  {object}
	 *     The mocked auth API interface.
	 */
	default: () => ({
		get: mockGet,
		hasAuthToken: mockHasAuthToken,
		post: mockPost,
		setAuthToken: mockSetAuthToken,
	}),
}));

vi.mock("@/composables/api/session-reset", () => ({
	resetAuthSession: mockResetAuthSession,
}));

import { useAuth } from ".";

/**
 * Create the auth wrapper in a Vue app context.
 *
 * @returns  {object}
 *     The auth composable state and actions.
 */
function createAuth() {
	return withAppContext(() => useAuth());
}

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAuthToken.mockReturnValue(false);
	});

	test("Initialises auth state", () => {
		// Auth state returned by the composable.
		const { errorMessage, hasAuthToken, isLoading, isReady, login } = createAuth();

		expect(errorMessage.value).toBe(null);
		expect(hasAuthToken).toBeTypeOf("function");
		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(login).toBeTypeOf("function");
	});

	describe("login", () => {
		test("Logs in, stores the auth token, and refreshes user details", async () => {
			// Login action returned by the composable.
			const { login } = createAuth();
			// Credentials submitted to the login endpoint.
			const credentials = { email: "test@example.com", password: "password" };

			mockHasAuthToken.mockReturnValue(true);
			mockPost.mockResolvedValueOnce({ authToken: "auth-token" });
			mockGet.mockResolvedValueOnce({ display_name: "Sophie Wardhaugh" });

			await login(credentials);

			expect(mockPost).toHaveBeenCalledWith("auth/login", credentials);
			expect(mockSetAuthToken).toHaveBeenCalledWith("auth-token");
			expect(mockGet).toHaveBeenCalledWith("auth/me/detailed");
		});

		test("Does not store a token or refresh user details when login fails", async () => {
			// Login action returned by the composable.
			const { login } = createAuth();

			mockPost.mockRejectedValueOnce(new Error("Login failed"));

			await expect(login({ email: "test@example.com", password: "password" })).rejects.toThrow(
				"Login failed",
			);

			expect(mockSetAuthToken).not.toHaveBeenCalled();
			expect(mockGet).not.toHaveBeenCalled();
		});

		test("Sets a generic error message when login fails without a known error code", async () => {
			// Auth error state and login action from the composable.
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce(new Error("Login failed"));

			await expect(login({ email: "test@example.com", password: "password" })).rejects.toThrow();

			expect(errorMessage.value).toBe("Something went wrong logging you in. Please try again.");
		});

		test("Sets an incorrect-credentials error message when login is unauthorised", async () => {
			// Auth error state and login action from the composable.
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce({ code: apiErrorCodes.ERROR_CODE_UNAUTHORIZED });

			await expect(
				login({ email: "test@example.com", password: "password" }),
			).rejects.toMatchObject({
				code: apiErrorCodes.ERROR_CODE_UNAUTHORIZED,
			});

			expect(errorMessage.value).toBe("Incorrect email or password");
			expect(mockSetAuthToken).not.toHaveBeenCalled();
		});

		test.each([apiErrorReasons.USER_NOT_FOUND, apiErrorReasons.INVALID_PASSWORD])(
			"Shows an incorrect-credentials message for %s",
			async (reason) => {
				// Auth error state and login action from the composable.
				const { errorMessage, login } = createAuth();

				mockPost.mockRejectedValueOnce({
					code: apiErrorCodes.ERROR_CODE_ACCESS_DENIED,
					payload: { reason },
				});

				await expect(
					login({ email: "test@example.com", password: "password" }),
				).rejects.toMatchObject({ payload: { reason } });

				expect(errorMessage.value).toBe("Incorrect email or password");
			},
		);

		test("Shows the missing-profile message before the unauthorised message", async () => {
			// Auth error state and login action from the composable.
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce({
				code: apiErrorCodes.ERROR_CODE_UNAUTHORIZED,
				payload: { reason: apiErrorReasons.PROFILE_NOT_FOUND },
			});

			await expect(
				login({ email: "test@example.com", password: "password" }),
			).rejects.toMatchObject({ payload: { reason: apiErrorReasons.PROFILE_NOT_FOUND } });

			expect(errorMessage.value).toBe(
				"Your account isn't fully set up yet. Please contact your administrator.",
			);
		});

		test.each([
			apiErrorReasons.MISSING_PERMISSION,
			apiErrorReasons.INSUFFICIENT_ACCESS,
			apiErrorReasons.NOT_PERMITTED,
		])("Shows the account-access message for %s", async (reason) => {
			// Auth error state and login action from the composable.
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce({
				code: apiErrorCodes.ERROR_CODE_ACCESS_DENIED,
				payload: { reason },
			});

			await expect(
				login({ email: "test@example.com", password: "password" }),
			).rejects.toMatchObject({ payload: { reason } });

			expect(errorMessage.value).toBe(
				"Your account doesn't have access to this system. Please contact your administrator.",
			);
		});

		test("Shows the too-many-attempts message", async () => {
			// Auth error state and login action from the composable.
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce({ code: apiErrorCodes.ERROR_CODE_TOO_MANY_REQUESTS });

			await expect(
				login({ email: "test@example.com", password: "password" }),
			).rejects.toMatchObject({ code: apiErrorCodes.ERROR_CODE_TOO_MANY_REQUESTS });

			expect(errorMessage.value).toBe(
				"Too many login attempts. Please wait a moment and try again.",
			);
		});

		describe("Account lockout", () => {
			beforeEach(() => {
				vi.stubEnv("TZ", "Europe/London");
				vi.useFakeTimers();
				vi.setSystemTime(new Date("2026-10-20T23:30:00.000Z"));
			});

			afterEach(() => {
				vi.useRealTimers();
				vi.unstubAllEnvs();
			});

			test.each([
				["today", "2026-10-21T11:13:00.000Z", "This account is locked out until 12:13"],
				[
					"on another day",
					"2026-10-22T11:13:00.000Z",
					"This account is locked out until 22 Oct 2026, 12:13",
				],
			])("Shows the lockout end time when it ends %s", async (_day, endTime, expectedMessage) => {
				// Auth error state and login action from the composable.
				const { errorMessage, login } = createAuth();

				mockPost.mockRejectedValueOnce({
					code: apiErrorCodes.ERROR_CODE_UNAUTHORIZED,
					payload: {
						lockout_until: new Date(endTime).getTime(),
						reason: apiErrorReasons.ACCOUNT_LOCKOUT,
					},
				});

				await expect(
					login({ email: "test@example.com", password: "password" }),
				).rejects.toMatchObject({ payload: { reason: apiErrorReasons.ACCOUNT_LOCKOUT } });

				expect(errorMessage.value).toBe(expectedMessage);
			});

			test.each([
				["in the past", new Date("2026-10-20T23:29:59.999Z").getTime()],
				["exactly now", new Date("2026-10-20T23:30:00.000Z").getTime()],
				["missing", undefined],
				["a date string", "2026-10-21T11:13:00.000Z"],
				["not a number", Number.NaN],
				["out of range", 8.64e15 + 1],
			])("Shows a temporary-lock message when the end time is %s", async (_case, lockoutUntil) => {
				// Auth error state and login action from the composable.
				const { errorMessage, login } = createAuth();

				mockPost.mockRejectedValueOnce({
					code: apiErrorCodes.ERROR_CODE_UNAUTHORIZED,
					payload: {
						lockout_until: lockoutUntil,
						reason: apiErrorReasons.ACCOUNT_LOCKOUT,
					},
				});

				await expect(
					login({ email: "test@example.com", password: "password" }),
				).rejects.toMatchObject({ payload: { reason: apiErrorReasons.ACCOUNT_LOCKOUT } });

				expect(errorMessage.value).toBe(
					"This account is temporarily locked. Please try again later.",
				);
			});
		});
	});

	describe("logout", () => {
		test("Resets the auth session", async () => {
			// Logout action returned by the composable.
			const { logout } = createAuth();

			await logout();

			expect(mockResetAuthSession).toHaveBeenCalled();
		});
	});
});
