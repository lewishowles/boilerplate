import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api";

/**
 * Guard protected routes behind authentication. Redirects unauthenticated
 * users to login, recording the intended path so login can return them
 * there, and clears any stale token and cached user when visiting the
 * login page.
 *
 * @param  {object}  to
 *     The route being navigated to.
 */
export default async function authMiddleware(to) {
	const { hasAuthToken, setAuthToken } = useApi();

	if (to.meta.requiresAuth && !hasAuthToken()) {
		return { path: "/login", query: { redirect: to.fullPath } };
	}

	if (to.path === "/login" && hasAuthToken()) {
		setAuthToken(null);
		clearCurrentUser();
	}
}
