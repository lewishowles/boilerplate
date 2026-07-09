import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";

const mockGet = vi.hoisted(() => vi.fn());
const mockHasAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-api", () => ({
	default: () => ({
		get: mockGet,
		hasAuthToken: mockHasAuthToken,
	}),
}));

import { useCurrentUser } from ".";

/**
 * Create the current-user query wrapper in a Vue app context.
 */
function createCurrentUser() {
	return withAppContext(() => useCurrentUser());
}

describe("useCurrentUser", () => {
	const validUser = {
		display_name: "Sophie Wardhaugh",
		permissions: ["site:view", "site:update"],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialisation", () => {
		test("Initialises with no user details", () => {
			const {
				haveUser,
				isInitialLoading,
				isReady,
				isRefreshing,
				lastFetched,
				refetch,
				userDetails,
			} = createCurrentUser();

			expect(userDetails.value).toBe(null);
			expect(haveUser.value).toBe(false);
			expect(isInitialLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
			expect(isRefreshing.value).toBe(false);
			expect(lastFetched.value).toBe(null);
			expect(refetch).toBeTypeOf("function");
		});

		test("Loads and stores user details", async () => {
			const { haveUser, isReady, refetch, userDetails } = createCurrentUser();

			mockGet.mockResolvedValueOnce(validUser);

			await refetch(true);

			expect(mockGet).toHaveBeenCalledWith("auth/me");
			expect(userDetails.value).toEqual(validUser);
			expect(haveUser.value).toBe(true);
			expect(isReady.value).toBe(true);
		});

		test("Does not update user details when the request fails", async () => {
			const { haveUser, refetch, userDetails } = createCurrentUser();

			mockGet.mockRejectedValueOnce(new Error("Request failed"));

			await expect(refetch(true)).rejects.toThrow();

			expect(userDetails.value).toBe(null);
			expect(haveUser.value).toBe(false);
		});
	});

	describe("Methods", () => {
		describe("clearCurrentUser", () => {
			test("Clears cached user details", async () => {
				const { clearCurrentUser, refetch, userDetails } = createCurrentUser();

				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);
				clearCurrentUser();

				expect(userDetails.value).toBe(null);
			});
		});

		describe("hasPermission", () => {
			test("Returns false when no user details are loaded", () => {
				const { hasPermission } = createCurrentUser();

				expect(hasPermission("site:view")).toBe(false);
			});

			test("Returns true when the user has the given permission", async () => {
				const { hasPermission, refetch } = createCurrentUser();

				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);

				expect(hasPermission("site:view")).toBe(true);
			});

			test("Returns false when the user does not have the given permission", async () => {
				const { hasPermission, refetch } = createCurrentUser();

				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);

				expect(hasPermission("site:delete")).toBe(false);
			});

			test("Returns true when the user has all given permissions", async () => {
				const { hasPermission, refetch } = createCurrentUser();

				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);

				expect(hasPermission(["site:view", "site:update"])).toBe(true);
			});

			test("Returns false when the user does not have all given permissions", async () => {
				const { hasPermission, refetch } = createCurrentUser();

				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);

				expect(hasPermission(["site:view", "site:delete"])).toBe(false);
			});
		});
	});
});
