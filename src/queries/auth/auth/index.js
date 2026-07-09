import { computed } from "vue";
import { defineMutationOptions, useMutation } from "@pinia/colada";
import { getPathValue } from "@lewishowles/helpers/object";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { useCurrentUser } from "../current-user";
import { resetAuthSession } from "@/composables/api/session-reset";
import useApi from "@/composables/api/use-api";

import { AUTH_KEYS } from "../keys.js";

/**
 * Log the user in with the provided credentials.
 *
 * @param  {object}  credentials
 *     Login form data.
 */
async function loginUser(credentials) {
	const { post } = useApi();

	return post("auth/login", credentials);
}

// Mutation options for logging the user in.
const loginMutation = defineMutationOptions({
	key: AUTH_KEYS.login,
	mutation: loginUser,
});

/**
 * User authentication.
 */
export function useAuth() {
	const { hasAuthToken, setAuthToken } = useApi();
	const { refetch: refetchCurrentUser } = useCurrentUser();

	const loginUserMutation = useMutation({
		...loginMutation,

		async onSuccess(body) {
			setAuthToken(body.authToken);

			await refetchCurrentUser(true);
		},
	});

	// Any general error message to display to the user.
	const errorMessage = computed(() => getErrorMessage(loginUserMutation.error.value));
	// Whether an error message has been set.
	const haveErrorMessage = computed(() => isNonEmptyString(errorMessage.value));

	/**
	 * Log the user into the system, then load their details.
	 *
	 * @param  {object}  credentials
	 *     Login form data.
	 */
	async function login(credentials) {
		await loginUserMutation.mutateAsync(credentials);
	}

	/**
	 * Log the user out.
	 */
	async function logout() {
		await resetAuthSession();
	}

	return {
		errorMessage,
		hasAuthToken,
		haveErrorMessage,
		isLoading: loginUserMutation.isLoading,
		isReady: computed(() => loginUserMutation.status.value === "success"),
		login,
		logout,
	};
}

/**
 * Determine the message to display to the user for a failed login. Extend
 * this per project once the API's own error codes are known.
 *
 * @param  {object}  error
 *     The error details returned from the login endpoint.
 */
function getErrorMessage(error) {
	if (!error) {
		return null;
	}

	const code = getPathValue(error, "code");

	if (code === "ERROR_CODE_UNAUTHORIZED") {
		return "Incorrect email or password";
	}

	return "Something went wrong logging you in. Please try again.";
}
