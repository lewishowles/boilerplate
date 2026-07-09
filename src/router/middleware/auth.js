import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api/use-api";

/**
 * Guard protected routes behind authentication. Redirects unauthenticated
 * users to login, and clears any stale token and cached user when visiting
 * the login page.
 *
 * @param  {object}  to
 *     The route being navigated to.
 */
export default async function authMiddleware(to) {
	const { hasAuthToken, setAuthToken } = useApi();

	if (to.meta.requiresAuth && !hasAuthToken()) {
		return { path: "/login" };
	}

	if (to.path === "/login" && hasAuthToken()) {
		setAuthToken(null);
		clearCurrentUser();
	}
}
