import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

// Mocked current-user cache-clearing action.
const mockClearCurrentUser = vi.hoisted(() => vi.fn());
// Mocked auth-token lookup method.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mocked auth-token storage action.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api", () => ({
	/**
	 * Return mocked auth API methods.
	 *
	 * @returns  {object}
	 *     The mocked auth API interface.
	 */
	default: () => ({
		hasAuthToken: mockHasAuthToken,
		setAuthToken: mockSetAuthToken,
	}),
}));

vi.mock("@/queries/auth/current-user", () => ({
	clearCurrentUser: mockClearCurrentUser,
}));

import authMiddleware from "./auth.js";

describe("authMiddleware", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockHasAuthToken.mockReturnValue(false);
	});

	describe("Protected routes", () => {
		// Protected route used by auth-guard tests.
		const protectedRoute = {
			fullPath: "/account?tab=security",
			meta: { requiresAuth: true },
			path: "/account",
		};

		test("Redirects to login with the complete route when no auth token exists", async () => {
			// Redirect returned by the auth guard.
			const result = await authMiddleware(protectedRoute, {});

			expect(result).toEqual({
				path: "/login",
				query: { redirect: "/account?tab=security" },
			});
		});

		test("Allows navigation when an auth token exists", async () => {
			mockHasAuthToken.mockReturnValue(true);

			// Navigation result returned by the auth guard.
			const result = await authMiddleware(protectedRoute, {});

			expect(result).toBeUndefined();
		});
	});

	describe("Login route", () => {
		// Login route used by auth-guard tests.
		const loginRoute = { meta: {}, path: "/login" };

		test("Clears the auth token when a token exists", async () => {
			mockHasAuthToken.mockReturnValue(true);

			await authMiddleware(loginRoute, {});

			expect(mockSetAuthToken).toHaveBeenCalledWith(null);
		});

		test("Clears the cached current user when a token exists", async () => {
			mockHasAuthToken.mockReturnValue(true);

			await authMiddleware(loginRoute, {});

			expect(mockClearCurrentUser).toHaveBeenCalled();
		});

		test("Allows access when not authenticated", async () => {
			// Navigation result returned by the auth guard.
			const result = await authMiddleware(loginRoute, {});

			expect(result).toBeUndefined();
		});
	});
});
