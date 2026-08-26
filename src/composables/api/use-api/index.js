import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { getPathValue as getPropertyValue, isNonEmptyObject } from "@lewishowles/helpers/object";
import { isNonEmptyString, ltrim, rtrim } from "@lewishowles/helpers/string";
import { ref } from "vue";

// Base URL prepended to all API calls.
const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

// localStorage key used to persist the auth token.
const authTokenStorageKey = "authToken";

// API error code returned when the current request is not authorised.
const unauthorisedErrorCode = "ERROR_CODE_UNAUTHORIZED";

/**
 * Composable for making API calls with fetch.
 */
export default function useApi() {
	// Base URL prepended to all API calls.
	let baseUrl = defaultBaseUrl;

	// Whether fetch is currently in progress.
	const isLoading = ref(false);
	// Whether data has loaded successfully.
	const isReady = ref(false);

	/**
	 * Perform an API request.
	 *
	 * @param  {string}  method
	 *     The HTTP method to use.
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Query string parameters or request body.
	 */
	async function makeApiCall(method, endpoint, parameters) {
		let finalEndpoint;

		try {
			isLoading.value = true;

			finalEndpoint = getFinalUrl(endpoint, method === "get" ? parameters : undefined);

			const response = await fetch(finalEndpoint, {
				method: method.toUpperCase(),
				headers: getHeaders(parameters, method),
				body: getBody(parameters, method),
			});

			const body = await response.json();

			if (!response.ok) {
				throw body;
			}

			isReady.value = true;

			return body;
		} catch (error) {
			const body = getErrorBody(error);

			if (finalEndpoint && !finalEndpoint.endsWith("/auth/login") && isUnauthorisedError(body)) {
				resetAuthSessionSilently();
			}

			throw body;
		} finally {
			isLoading.value = false;
		}
	}

	/**
	 * Perform a GET request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Query string parameters.
	 */
	async function get(endpoint, parameters) {
		return makeApiCall("get", endpoint, parameters);
	}

	/**
	 * Perform a POST request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Request body parameters.
	 */
	async function post(endpoint, parameters) {
		return makeApiCall("post", endpoint, parameters);
	}

	/**
	 * Perform a PATCH request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Request body parameters.
	 */
	async function patch(endpoint, parameters) {
		return makeApiCall("patch", endpoint, parameters);
	}

	/**
	 * Build the final request URL.
	 *
	 * @param  {string}  endpoint
	 *     Endpoint path to append to baseUrl.
	 * @param  {object}  parameters
	 *     Query string parameters.
	 */
	function getFinalUrl(endpoint, parameters) {
		if (!isNonEmptyString(baseUrl)) {
			throw new Error(
				`Expected non-empty string <baseUrl>, received ${getFriendlyDisplay(baseUrl)}`,
			);
		}

		const standardisedEndpoint = ltrim(endpoint, "/");

		if (!isNonEmptyString(standardisedEndpoint)) {
			throw new Error(
				`Expected non-empty string <endpoint>, received ${getFriendlyDisplay(endpoint)}`,
			);
		}

		const query = isNonEmptyObject(parameters) ? new URLSearchParams(parameters).toString() : "";
		const url = `${rtrim(baseUrl, "/")}/${standardisedEndpoint}`;

		return [url, query].filter((part) => isNonEmptyString(part)).join("?");
	}

	/**
	 * Get the useful API error body, if the request failed with a response wrapper.
	 *
	 * @param  {Error|object}  error
	 *     The error thrown by fetch or another runtime failure.
	 */
	function getErrorBody(error) {
		if (typeof error?.getResponse !== "function") {
			return error;
		}

		const response = error.getResponse();

		if (typeof response?.getBody !== "function") {
			return error;
		}

		return response.getBody();
	}

	/**
	 * Check whether an API failure means the current auth session is invalid.
	 *
	 * @param  {object}  body
	 *     The normalised API error body.
	 */
	function isUnauthorisedError(body) {
		return getPropertyValue(body, "code") === unauthorisedErrorCode;
	}

	/**
	 * Reset auth without replacing the original API error.
	 *
	 * Imported dynamically to break a real circular dependency: session-reset
	 * imports the application `useApi` composable, which imports this file.
	 * A static import here would hit that cycle during module initialisation.
	 */
	function resetAuthSessionSilently() {
		import("@/composables/api/session-reset")
			.then(({ resetAuthSession }) => resetAuthSession().catch(() => null))
			.catch(() => null);
	}

	/**
	 * Build the headers for a request: a bearer auth header when a token is
	 * stored, and a JSON content-type header when a request body is present.
	 *
	 * @param  {object}  parameters
	 *     Request body parameters.
	 * @param  {string}  method
	 *     The HTTP method to use.
	 */
	function getHeaders(parameters, method) {
		const headers = {};
		const authToken = localStorage.getItem(authTokenStorageKey);

		if (isNonEmptyString(authToken)) {
			headers.Authorization = `Bearer ${authToken}`;
		}

		if (method !== "get" && isNonEmptyObject(parameters)) {
			headers["Content-Type"] = "application/json";
		}

		return Object.keys(headers).length > 0 ? headers : undefined;
	}

	/**
	 * Return the request body for non-GET requests.
	 *
	 * @param  {object}  parameters
	 *     Request body parameters.
	 * @param  {string}  method
	 *     The HTTP method to use.
	 */
	function getBody(parameters, method) {
		if (method === "get" || !isNonEmptyObject(parameters)) {
			return undefined;
		}

		return JSON.stringify(parameters);
	}

	/**
	 * Perform a DELETE request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 */
	async function remove(endpoint) {
		return makeApiCall("delete", endpoint);
	}

	/**
	 * Get the current base URL.
	 */
	function getBaseUrl() {
		return baseUrl;
	}

	/**
	 * Update the base URL for this instance.
	 *
	 * @param  {string}  url
	 *     The URL to set.
	 */
	function setBaseUrl(url) {
		if (!isNonEmptyString(url)) {
			throw new Error(`Expected non-empty string <url>, received ${getFriendlyDisplay(url)}`);
		}

		baseUrl = url;
	}

	/**
	 * Check whether an auth token is currently stored.
	 */
	function hasAuthToken() {
		return isNonEmptyString(localStorage.getItem(authTokenStorageKey));
	}

	/**
	 * Store the auth token for authenticated requests.
	 *
	 * @param  {string|null}  authToken
	 *     The token returned from the login endpoint, or null to clear it.
	 */
	function setAuthToken(authToken) {
		if (isNonEmptyString(authToken)) {
			localStorage.setItem(authTokenStorageKey, authToken);
		} else {
			localStorage.removeItem(authTokenStorageKey);
		}
	}

	return {
		delete: remove,
		get,
		getBaseUrl,
		getFinalUrl,
		hasAuthToken,
		isLoading,
		isReady,
		isUnauthorisedError,
		patch,
		post,
		setAuthToken,
		setBaseUrl,
	};
}
