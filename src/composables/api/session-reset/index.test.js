import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { resetAuthSession } from ".";

// Mock used to observe cached-user clearing.
const mockClearCurrentUser = vi.hoisted(() => vi.fn());
// Mock used to observe auth-token lookup.
const mockHasAuthToken = vi.hoisted(() => vi.fn());

// Mock used to represent the current route.
const mockCurrentRoute = vi.hoisted(() => ({
	value: { fullPath: "/account?tab=security", name: "account" },
}));

// Mock used to observe login navigation.
const mockPush = vi.hoisted(() => vi.fn());
// Mock used to observe auth token removal.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api", () => ({
	/**
	 * Return the API methods used by session reset.
	 *
	 * @returns  {object}
	 *     An object containing auth-token methods.
	 */
	default: () => ({ hasAuthToken: mockHasAuthToken, setAuthToken: mockSetAuthToken }),
}));

vi.mock("@/queries/auth/current-user", () => ({
	clearCurrentUser: mockClearCurrentUser,
}));

vi.mock("@/router", () => ({
	default: { currentRoute: mockCurrentRoute, push: mockPush },
}));

describe("resetAuthSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAuthToken.mockReturnValue(true);
		mockCurrentRoute.value = { fullPath: "/account?tab=security", name: "account" };
	});

	test("Clears the stored auth token", async () => {
		await resetAuthSession();

		expect(mockSetAuthToken).toHaveBeenCalledWith(null);
	});

	test("Clears the cached current user", async () => {
		await resetAuthSession();

		expect(mockClearCurrentUser).toHaveBeenCalled();
	});

	test("Redirects to login with the current route", async () => {
		await resetAuthSession();

		expect(mockPush).toHaveBeenCalledWith({
			name: "login",
			query: { redirect: "/account?tab=security" },
		});
	});

	test("Does not navigate when the current route is already login", async () => {
		mockCurrentRoute.value = { fullPath: "/login", name: "login" };

		await resetAuthSession();

		expect(mockPush).not.toHaveBeenCalled();
	});

	test("Does not clear or navigate when the auth token is already absent", async () => {
		mockHasAuthToken.mockReturnValue(false);

		await resetAuthSession();

		expect(mockSetAuthToken).not.toHaveBeenCalled();
		expect(mockClearCurrentUser).not.toHaveBeenCalled();
		expect(mockPush).not.toHaveBeenCalled();
	});
});
