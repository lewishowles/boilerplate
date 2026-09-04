import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { resetAuthSession } from ".";

// Mock used to observe cached-user clearing.
const mockClearCurrentUser = vi.hoisted(() => vi.fn());
// Mock used to observe login navigation.
const mockPush = vi.hoisted(() => vi.fn());
// Mock used to observe auth token removal.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api", () => ({
	/**
	 * Return the API method used by session reset.
	 *
	 * @returns  {object}
	 *     An object containing the auth token setter.
	 */
	default: () => ({ setAuthToken: mockSetAuthToken }),
}));

vi.mock("@/queries/auth/current-user", () => ({
	clearCurrentUser: mockClearCurrentUser,
}));

vi.mock("@/router", () => ({
	default: { push: mockPush },
}));

describe("resetAuthSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Clears the stored auth token", async () => {
		await resetAuthSession();

		expect(mockSetAuthToken).toHaveBeenCalledWith(null);
	});

	test("Clears the cached current user", async () => {
		await resetAuthSession();

		expect(mockClearCurrentUser).toHaveBeenCalled();
	});

	test("Redirects to the login page", async () => {
		await resetAuthSession();

		expect(mockPush).toHaveBeenCalledWith({ name: "login" });
	});
});
