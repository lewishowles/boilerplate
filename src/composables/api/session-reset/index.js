import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api";
import router from "@/router";

/**
 * Clear local auth state and return the user to the login page.
 *
 * @returns  {Promise<void>}
 *     Completion after the login navigation finishes.
 */
export async function resetAuthSession() {
	// API method used to remove the stored auth token.
	const { setAuthToken } = useApi();

	setAuthToken(null);
	clearCurrentUser();

	await router.push({ name: "login" });
}
