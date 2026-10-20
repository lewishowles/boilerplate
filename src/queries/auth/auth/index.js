import { resetAuthSession } from "@/composables/api/session-reset";
import { apiErrorCodes, apiErrorReasons } from "@/constants/api.js";
import { useCurrentUser } from "@/queries/auth/current-user";
import { AUTH_KEYS } from "@/queries/auth/keys.js";
import { formatDate } from "@lewishowles/helpers/date";
import { getPathValue } from "@lewishowles/helpers/object";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { defineMutationOptions, useMutation } from "@pinia/colada";
import { computed } from "vue";

import useAuthApi from "@/composables/api/use-auth-api";

/**
 * Log the user in with the provided credentials.
 *
 * @param  {object}  credentials
 *     Login form data.
 *
 * @returns  {Promise<object>}
 *     The login response body.
 */
async function loginUser(credentials) {
	// Auth API method used to submit the credentials.
	const { post } = useAuthApi();

	return post("auth/login", credentials);
}

// Mutation options for logging the user in.
const loginMutation = defineMutationOptions({
	key: AUTH_KEYS.login,
	mutation: loginUser,
});

/**
 * User authentication.
 *
 * @returns  {object}
 *     Auth state and actions for the current user.
 */
export function useAuth() {
	// Auth token methods used by the auth state.
	const { hasAuthToken, setAuthToken } = useAuthApi();
	// Query refresh action used after a successful login.
	const { refetch: refetchCurrentUser } = useCurrentUser();

	// Login request state and mutation action.
	const loginUserMutation = useMutation({
		...loginMutation,

		/**
		 * Store the auth token and refresh the current user.
		 *
		 * @param  {object}  body
		 *     The successful login response.
		 */
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
 * Determine the message to display to the user for a failed login.
 *
 * @param  {object}  error
 *     The error details returned from the login endpoint.
 *
 * @returns  {string|null}
 *     The error message to display, or null when no error exists.
 */
function getErrorMessage(error) {
	if (!error) {
		return null;
	}

	// API error code used to select the message.
	const code = getPathValue(error, "code");
	// The more specific cause the API sometimes sends with the code. It is
	// checked first, so it decides the message when both are present.
	const reason = getPathValue(error, "payload.reason");

	if (reason === apiErrorReasons.ACCOUNT_LOCKOUT) {
		return getLockoutMessage(getPathValue(error, "payload.lockout_until"));
	}

	if (reason === apiErrorReasons.PROFILE_NOT_FOUND) {
		return "Your account isn't fully set up yet. Please contact your administrator.";
	}

	if (
		reason === apiErrorReasons.MISSING_PERMISSION ||
		reason === apiErrorReasons.INSUFFICIENT_ACCESS ||
		reason === apiErrorReasons.NOT_PERMITTED
	) {
		return "Your account doesn't have access to this system. Please contact your administrator.";
	}

	if (reason === apiErrorReasons.USER_NOT_FOUND || reason === apiErrorReasons.INVALID_PASSWORD) {
		return "Incorrect email or password";
	}

	if (code === apiErrorCodes.ERROR_CODE_TOO_MANY_REQUESTS) {
		return "Too many login attempts. Please wait a moment and try again.";
	}

	if (code === apiErrorCodes.ERROR_CODE_UNAUTHORIZED) {
		return "Incorrect email or password";
	}

	return "Something went wrong logging you in. Please try again.";
}

/**
 * Tell the user when their locked account can log in again: the time alone if
 * the lockout ends today, or the date and time if it ends on another day. Show
 * a general message instead when the end time is missing, already passed, or
 * unreadable.
 *
 * @param  {number}  lockoutUntil
 *     When the lockout ends, as a millisecond timestamp.
 *
 * @returns  {string}
 *     The message to show for a locked account.
 */
function getLockoutMessage(lockoutUntil) {
	// The message to show when the lockout end time cannot be used.
	const fallback = "This account is temporarily locked. Please try again later.";

	if (!Number.isFinite(lockoutUntil) || lockoutUntil <= Date.now()) {
		return fallback;
	}

	// The calendar day when the lockout ends.
	const lockoutDay = formatDate(lockoutUntil, "YYYY-MM-DD");

	// A finite timestamp can still be outside the range formatDate supports, in
	// which case it gives null.
	if (!lockoutDay) {
		return fallback;
	}

	// Today's calendar day in the same time zone as the lockout end.
	const today = formatDate(Date.now(), "YYYY-MM-DD");
	// The end time format, with the date shown only when it is another day. The
	// date helpers have no time-only preset, so a lockout ending today uses the
	// time half of their dateTime preset.
	const lockoutEndFormat = lockoutDay === today ? { timeStyle: "short" } : "dateTime";
	// The formatted end time to show to the user.
	const lockoutEnd = formatDate(lockoutUntil, lockoutEndFormat);

	return `This account is locked out until ${lockoutEnd}`;
}
