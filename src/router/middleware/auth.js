import { useQueryCache } from "@pinia/colada";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { clearCurrentUser, currentUserQueryOptions } from "@/queries/auth/current-user";
import useApi from "@/composables/api";

/**
 * Guard protected routes behind authentication. Before a protected page
 * renders, confirm the stored token still belongs to a signed-in user. An
 * expired session is redirected to login.
 *
 * Failed checks redirect to login with the intended path so login can return
 * the user there. In dev, set VITE_MOCK_AUTH=true to bypass the guard.
 *
 * @param  {object}  to
 *     The route being navigated to.
 *
 * @returns  {object|undefined}
 *     A login redirect when a protected route has no token, or when the stored
 *     session no longer belongs to a signed-in user.
 */
export default async function authMiddleware(to) {
	// Auth-token methods used by the route guard.
	const { hasAuthToken, setAuthToken } = useApi();

	// Development-only bypass driven by VITE_MOCK_AUTH.
	const isMockAuth = import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === "true";

	if (to.meta.requiresAuth && !isMockAuth) {
		// The login page, set up to return the user here after they sign in.
		const loginRedirect = { path: "/login", query: { redirect: to.fullPath } };

		if (!hasAuthToken()) {
			return loginRedirect;
		}

		// Use the same cached user as the rest of the app, so the check only
		// waits for the server on a cold load or once the cached user is stale.
		const queryCache = useQueryCache();
		// Query entry for the current user's data.
		const currentUserQuery = queryCache.ensure(currentUserQueryOptions);
		// The current-user query state after the refresh, or null when the
		// request fails, which counts as signed out.
		const currentUserState = await queryCache.refresh(currentUserQuery).catch(() => null);
		// The signed-in user from the server, if there is one.
		const currentUser = currentUserState?.data;

		if (!isNonEmptyObject(currentUser)) {
			setAuthToken(null);
			clearCurrentUser();

			return loginRedirect;
		}
	}

	if (to.path === "/login" && hasAuthToken()) {
		setAuthToken(null);
		clearCurrentUser();
	}
}
