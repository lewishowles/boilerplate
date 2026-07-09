import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { resetAuthSession } from ".";

const mockClearCurrentUser = vi.hoisted(() => vi.fn());
const mockPush = vi.hoisted(() => vi.fn());
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-api", () => ({
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
