import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

const mockClearCurrentUser = vi.hoisted(() => vi.fn());
const mockHasAuthToken = vi.hoisted(() => vi.fn());
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-api", () => ({
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
		const protectedRoute = { meta: { requiresAuth: true }, path: "/dashboard" };

		test("Redirects to login when no auth token exists", async () => {
			const result = await authMiddleware(protectedRoute, {});

			expect(result).toEqual({ path: "/login" });
		});

		test("Allows navigation when an auth token exists", async () => {
			mockHasAuthToken.mockReturnValue(true);

			const result = await authMiddleware(protectedRoute, {});

			expect(result).toBeUndefined();
		});
	});

	describe("Login route", () => {
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
			const result = await authMiddleware(loginRoute, {});

			expect(result).toBeUndefined();
		});
	});
});
