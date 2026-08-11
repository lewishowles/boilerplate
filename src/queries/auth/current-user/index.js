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
 */
export function useCurrentUser() {
	const { hasAuthToken } = useAuthApi();

	const currentUser = useQueryWrapper({
		queryOptions: () => ({
			...currentUserQueryOptions,
			enabled: isMockAuth || hasAuthToken(),
		}),
		isReady: (data) => isNonEmptyObject(data),
	});

	// The returned user details.
	const userDetails = currentUser.data;
	// Whether a user's details are present.
	const haveUser = computed(() => isNonEmptyObject(userDetails.value));

	/**
	 * Determine whether the current user has all of the given permissions.
	 * Assumes a flat `permissions` array on the user record; adjust the path
	 * to match the shape returned by the project's own API.
	 *
	 * @param  {string|string[]}  permission
	 *     The permission or permissions required.
	 */
	function hasPermission(permission) {
		if (!haveUser.value) {
			return false;
		}

		const permissions = Array.isArray(permission) ? permission : [permission];
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
 */
async function getCurrentUser() {
	if (isMockAuth) {
		return {
			display_name: "Sophie Wardhaugh",
			permissions: [],
		};
	}

	const { get } = useAuthApi();

	return get("auth/me");
}
