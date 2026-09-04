import { computed } from "vue";
import { defineQueryOptions, useQueryCache } from "@pinia/colada";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";
import useAuthApi from "@/composables/api/use-auth-api";

import { AUTH_KEYS } from "../keys.js";

// Development-only bypass driven by VITE_MOCK_AUTH.
const isMockAuth = import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === "true";

/**
 * Provide access to the logged-in user's details.
 *
 * @returns  {object}
 *     Current-user query state and actions.
 */
export function useCurrentUser() {
	// Auth-token lookup used to enable the current-user query.
	const { hasAuthToken } = useAuthApi();

	// Current-user query state and actions.
	const currentUser = useQueryWrapper({
		/**
		 * Build options for the current-user query.
		 *
		 * @returns  {object}
		 *     The current-user query options.
		 */
		queryOptions: () => ({
			...currentUserQueryOptions,
			enabled: isMockAuth || hasAuthToken(),
		}),
		/**
		 * Check whether current-user data is ready.
		 *
		 * @param  {object}  data
		 *     The current-user query data.
		 *
		 * @returns  {boolean}
		 *     Whether the query data contains user details.
		 */
		isReady: (data) => isNonEmptyObject(data),
	});

	// The returned user details.
	const userDetails = currentUser.data;
	// Whether a user's details are present.
	const haveUser = computed(() => isNonEmptyObject(userDetails.value));

	/**
	 * Determines whether the current user has all requested permissions. Assumes a
	 * flat `permissions` array on the user record; adjust the path to match the
	 * shape returned by the project's own API.
	 *
	 * @param  {string|string[]}  permission
	 *     The permission or permissions required.
	 *
	 * @returns  {boolean}
	 *     Whether the current user has every requested permission.
	 */
	function hasPermission(permission) {
		if (!haveUser.value) {
			return false;
		}

		// Requested permissions normalised as an array.
		const permissions = Array.isArray(permission) ? permission : [permission];
		// Permissions assigned to the current user.
		const userPermissions = userDetails.value.permissions ?? [];

		return permissions.every((entry) => userPermissions.includes(entry));
	}

	/**
	 * Remove the cached user after logout or auth reset.
	 */
	function clearCurrentUserDetails() {
		clearCurrentUser();
	}

	return {
		...currentUser,
		clearCurrentUser: clearCurrentUserDetails,
		hasPermission,
		haveUser,
		userDetails,
	};
}

/**
 * Remove the cached current-user query data.
 *
 * @param  {object}  [queryCache]
 *     Pinia Colada query cache instance.
 */
export function clearCurrentUser(queryCache = useQueryCache()) {
	queryCache.setQueryData(AUTH_KEYS.currentUser, null);
}

// Query options for the current user.
const currentUserQueryOptions = defineQueryOptions({
	key: AUTH_KEYS.currentUser,
	query: getCurrentUser,
});

/**
 * Load the current user's details. In dev, returns fixture data instead of
 * calling the API when VITE_MOCK_AUTH=true.
 *
 * @returns  {Promise<object>}
 *     The current user's details.
 */
async function getCurrentUser() {
	if (isMockAuth) {
		return {
			id: 1,
			email: "sophie.wardhaugh@example.com",
			created_at: "2025-01-01T00:00:00.000Z",
		};
	}

	// Auth API method used to load the current user.
	const { get } = useAuthApi();

	return get("auth/me");
}
