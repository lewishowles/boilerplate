import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

// Mocked current-user cache-clearing action.
const mockClearCurrentUser = vi.hoisted(() => vi.fn());
// Mocked auth-token lookup method.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mocked current-user query refresh action.
const mockRefreshCurrentUser = vi.hoisted(() => vi.fn());
// Mocked auth-token storage action.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

// Mocked current-user query entry.
const mockCurrentUserEntry = vi.hoisted(() => ({
	state: { data: { display_name: "Sophie Wardhaugh" }, status: "success" },
}));

// Mocked current-user query options.
const mockCurrentUserQueryOptions = vi.hoisted(() => ({ key: ["user"] }));
// Mocked query-cache ensure action.
const mockEnsureCurrentUser = vi.hoisted(() => vi.fn(() => mockCurrentUserEntry));

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
	currentUserQueryOptions: mockCurrentUserQueryOptions,
}));

vi.mock("@pinia/colada", () => ({
	/**
	 * Return mocked query-cache methods.
	 *
	 * @returns  {object}
	 *     The mocked query-cache interface.
	 */
	useQueryCache: () => ({
		ensure: mockEnsureCurrentUser,
		refresh: mockRefreshCurrentUser,
	}),
}));

import authMiddleware from "./auth.js";

describe("authMiddleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAuthToken.mockReturnValue(false);
		mockCurrentUserEntry.state = {
			data: { display_name: "Sophie Wardhaugh" },
			status: "success",
		};
		mockRefreshCurrentUser.mockResolvedValue(mockCurrentUserEntry.state);
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
			expect(mockEnsureCurrentUser).toHaveBeenCalledWith(mockCurrentUserQueryOptions);
			expect(mockRefreshCurrentUser).toHaveBeenCalledWith(mockCurrentUserEntry);
		});

		test("Redirects and clears auth state when the current user is empty", async () => {
			mockHasAuthToken.mockReturnValue(true);
			mockCurrentUserEntry.state = { data: null, status: "success" };
			mockRefreshCurrentUser.mockResolvedValue(mockCurrentUserEntry.state);

			const result = await authMiddleware(protectedRoute, {});

			expect(mockSetAuthToken).toHaveBeenCalledWith(null);
			expect(mockClearCurrentUser).toHaveBeenCalled();
			expect(result).toEqual({
				path: "/login",
				query: { redirect: "/account?tab=security" },
			});
		});

		test("Redirects and clears auth state when loading the current user fails", async () => {
			mockHasAuthToken.mockReturnValue(true);
			mockRefreshCurrentUser.mockRejectedValueOnce(new Error("Request failed"));

			const result = await authMiddleware(protectedRoute, {});

			expect(mockSetAuthToken).toHaveBeenCalledWith(null);
			expect(mockClearCurrentUser).toHaveBeenCalled();
			expect(result).toEqual({
				path: "/login",
				query: { redirect: "/account?tab=security" },
			});
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
