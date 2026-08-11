import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api";

/**
 * Guard protected routes behind authentication. Redirects unauthenticated
 * users to login, recording the intended path so login can return them
 * there, and clears any stale token and cached user when visiting the
 * login page. In dev, set VITE_MOCK_AUTH=true to bypass the guard.
 *
 * @param  {object}  to
 *     The route being navigated to.
 */
export default async function authMiddleware(to) {
	const { hasAuthToken, setAuthToken } = useApi();

	// Development-only bypass driven by VITE_MOCK_AUTH.
	const isMockAuth = import.meta.env.DEV && import.meta.env.VITE_MOCK_AUTH === "true";

	if (to.meta.requiresAuth && !isMockAuth && !hasAuthToken()) {
		return { path: "/login", query: { redirect: to.fullPath } };
	}

	if (to.path === "/login" && hasAuthToken()) {
		setAuthToken(null);
		clearCurrentUser();
	}
}
