import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";

// Mocked auth API GET method.
const mockGet = vi.hoisted(() => vi.fn());
// Mocked auth-token lookup method.
const mockHasAuthToken = vi.hoisted(() => vi.fn());

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
	}),
}));

import { clearCurrentUser, useCurrentUser } from ".";

import { AUTH_KEYS } from "../keys.js";

/**
 * Create the current-user query wrapper in a Vue app context.
 *
 * @returns  {object}
 *     The current-user query state and actions.
 */
function createCurrentUser() {
	return withAppContext(() => useCurrentUser());
}

describe("useCurrentUser", () => {
	// User record used by current-user query tests.
	const validUser = {
		id: 1,
		display_name: "Sophie Wardhaugh",
		email: "sophie.wardhaugh@example.com",
		created_at: "2025-01-01T00:00:00.000Z",
	};

	// User record with permissions used by permission tests.
	const userWithPermissions = {
		...validUser,
		permissions: ["site:view", "site:update"],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialisation", () => {
		test("Initialises with no user details", () => {
			// Current-user query state returned by the composable.
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
			// Current-user query state and refetch action.
			const { haveUser, isReady, refetch, userDetails } = createCurrentUser();

			mockHasAuthToken.mockReturnValue(true);
			mockGet.mockResolvedValueOnce(validUser);

			await refetch(true);

			expect(mockGet).toHaveBeenCalledWith("auth/me/detailed");
			expect(userDetails.value).toEqual(validUser);
			expect(haveUser.value).toBe(true);
			expect(isReady.value).toBe(true);
		});

		test("Does not update user details when the request fails", async () => {
			// Current-user query state and refetch action.
			const { haveUser, refetch, userDetails } = createCurrentUser();

			mockHasAuthToken.mockReturnValue(true);
			mockGet.mockRejectedValueOnce(new Error("Request failed"));

			await expect(refetch(true)).rejects.toThrow();

			expect(userDetails.value).toBe(null);
			expect(haveUser.value).toBe(false);
		});
	});

	describe("Methods", () => {
		describe("clearCurrentUser", () => {
			test("Clears the current-user query data", () => {
				// Mocked cache update method.
				const setQueryData = vi.fn();
				// Query cache passed to the cache-clearing action.
				const queryCache = { setQueryData };

				clearCurrentUser(queryCache);

				expect(setQueryData).toHaveBeenCalledWith(AUTH_KEYS.currentUser, null);
			});

			test("Clears cached user details", async () => {
				// Current-user query state and actions.
				const { clearCurrentUser, refetch, userDetails } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);
				clearCurrentUser();

				expect(userDetails.value).toBe(null);
			});
		});

		describe("hasPermission", () => {
			test("Returns false when no user details are loaded", () => {
				// Permission check returned by the composable.
				const { hasPermission } = createCurrentUser();

				expect(hasPermission("site:view")).toBe(false);
			});

			test("Returns false when the loaded user has no permissions", async () => {
				// Permission check and refetch action from the composable.
				const { hasPermission, refetch } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(validUser);

				await refetch(true);

				expect(hasPermission("site:view")).toBe(false);
			});

			test("Returns true when the user has the given permission", async () => {
				// Permission check and refetch action from the composable.
				const { hasPermission, refetch } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(userWithPermissions);

				await refetch(true);

				expect(hasPermission("site:view")).toBe(true);
			});

			test("Returns false when the user does not have the given permission", async () => {
				// Permission check and refetch action from the composable.
				const { hasPermission, refetch } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(userWithPermissions);

				await refetch(true);

				expect(hasPermission("site:delete")).toBe(false);
			});

			test("Returns true when the user has all given permissions", async () => {
				// Permission check and refetch action from the composable.
				const { hasPermission, refetch } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(userWithPermissions);

				await refetch(true);

				expect(hasPermission(["site:view", "site:update"])).toBe(true);
			});

			test("Returns false when the user does not have all given permissions", async () => {
				// Permission check and refetch action from the composable.
				const { hasPermission, refetch } = createCurrentUser();

				mockHasAuthToken.mockReturnValue(true);
				mockGet.mockResolvedValueOnce(userWithPermissions);

				await refetch(true);

				expect(hasPermission(["site:view", "site:delete"])).toBe(false);
			});
		});
	});
});
