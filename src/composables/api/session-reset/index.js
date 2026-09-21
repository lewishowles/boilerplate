import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api";
import router from "@/router";

/**
 * Clear local auth state and return the user to the login page.
 *
 * @returns  {Promise<void>}
 *     Resolves after the login redirect, or at once when none is needed.
 */
export async function resetAuthSession() {
	// API methods used to remove the stored auth token.
	const { hasAuthToken, setAuthToken } = useApi();

	// Without a token, the route guard or logout has already signed the user
	// out. The caller can be a 401 raised during the route guard, so navigating
	// again would replace that redirect and lose the page the user was trying
	// to reach.
	if (!hasAuthToken()) {
		return;
	}

	setAuthToken(null);
	clearCurrentUser();

	// The page where the session expired, so login can return the user there.
	const currentRoute = router.currentRoute.value;

	// There is nowhere to send the user if they are already on the login page.
	if (currentRoute.name === "login") {
		return;
	}

	await router.push({
		name: "login",
		query: { redirect: currentRoute.fullPath },
	});
}
