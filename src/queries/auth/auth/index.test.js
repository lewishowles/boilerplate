import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";

const mockGet = vi.hoisted(() => vi.fn());
const mockHasAuthToken = vi.hoisted(() => vi.fn(() => false));
const mockPost = vi.hoisted(() => vi.fn());
const mockResetAuthSession = vi.hoisted(() => vi.fn());
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-api", () => ({
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
 */
function createAuth() {
	return withAppContext(() => useAuth());
}

describe("useAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Initialises auth state", () => {
		const { errorMessage, hasAuthToken, isLoading, isReady, login } = createAuth();

		expect(errorMessage.value).toBe(null);
		expect(hasAuthToken).toBeTypeOf("function");
		expect(isLoading.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(login).toBeTypeOf("function");
	});

	describe("login", () => {
		test("Logs in, stores the auth token, and refreshes user details", async () => {
			const { login } = createAuth();
			const credentials = { email: "test@example.com", password: "password" };

			mockPost.mockResolvedValueOnce({ authToken: "auth-token" });
			mockGet.mockResolvedValueOnce({ display_name: "Sophie Wardhaugh" });

			await login(credentials);

			expect(mockPost).toHaveBeenCalledWith("auth/login", credentials);
			expect(mockSetAuthToken).toHaveBeenCalledWith("auth-token");
			expect(mockGet).toHaveBeenCalledWith("auth/me");
		});

		test("Does not store a token or refresh user details when login fails", async () => {
			const { login } = createAuth();

			mockPost.mockRejectedValueOnce(new Error("Login failed"));

			await expect(login({ email: "test@example.com", password: "password" })).rejects.toThrow(
				"Login failed",
			);

			expect(mockSetAuthToken).not.toHaveBeenCalled();
			expect(mockGet).not.toHaveBeenCalled();
		});

		test("Sets a generic error message when login fails without a known error code", async () => {
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce(new Error("Login failed"));

			await expect(login({ email: "test@example.com", password: "password" })).rejects.toThrow();

			expect(errorMessage.value).toBe("Something went wrong logging you in. Please try again.");
		});

		test("Sets an incorrect-credentials error message when login is unauthorised", async () => {
			const { errorMessage, login } = createAuth();

			mockPost.mockRejectedValueOnce({ code: "ERROR_CODE_UNAUTHORIZED" });

			await expect(
				login({ email: "test@example.com", password: "password" }),
			).rejects.toMatchObject({
				code: "ERROR_CODE_UNAUTHORIZED",
			});

			expect(errorMessage.value).toBe("Incorrect email or password");
			expect(mockSetAuthToken).not.toHaveBeenCalled();
		});
	});

	describe("logout", () => {
		test("Resets the auth session", async () => {
			const { logout } = createAuth();

			await logout();

			expect(mockResetAuthSession).toHaveBeenCalled();
		});
	});
});
