import { clearCurrentUser } from "@/queries/auth/current-user";
import useApi from "@/composables/api/use-api";
import router from "@/router";

/**
 * Clear local auth state and return the user to the login page.
 */
export async function resetAuthSession() {
	const { setAuthToken } = useApi();

	setAuthToken(null);
	clearCurrentUser();

	await router.push({ name: "login" });
}
