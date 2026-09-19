import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { getPathValue as getPropertyValue, isNonEmptyObject } from "@lewishowles/helpers/object";
import { isNonEmptyString, ltrim, rtrim } from "@lewishowles/helpers/string";
import { useStorage } from "@vueuse/core";
import { ref } from "vue";

// Base URL prepended to all API calls.
const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

// localStorage key used to persist the auth token.
const authTokenStorageKey = "authToken";
// The saved auth token, shared by every useApi() call and kept in sync
// across browser tabs.
const authToken = useStorage(authTokenStorageKey, null, undefined, { flush: "sync" });

// API error code returned when the current request is not authorised.
const unauthorisedErrorCode = "ERROR_CODE_UNAUTHORIZED";

/**
 * Composable for making API calls with fetch.
 *
 * @returns  {object}
 *     API methods and reactive request state.
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
	 *
	 * @throws  {object}
	 *     The normalised API error body when the request fails.
	 *
	 * @returns  {Promise<object>}
	 *     The parsed API response body.
	 */
	async function makeApiCall(method, endpoint, parameters) {
		// URL used for the in-progress request.
		let finalEndpoint;

		try {
			isLoading.value = true;

			finalEndpoint = getFinalUrl(endpoint, method === "get" ? parameters : undefined);

			// Fetch response for the requested API endpoint.
			const response = await fetch(finalEndpoint, {
				method: method.toUpperCase(),
				headers: getHeaders(parameters, method),
				body: getBody(parameters, method),
			});

			// Parsed response body returned to the caller.
			const body = await response.json();

			if (!response.ok) {
				throw body;
			}

			isReady.value = true;

			return body;
		} catch (error) {
			// Error body used to decide whether the auth session has expired.
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
	 *
	 * @returns  {Promise<object>}
	 *     The parsed API response body.
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
	 *
	 * @returns  {Promise<object>}
	 *     The parsed API response body.
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
	 *
	 * @returns  {Promise<object>}
	 *     The parsed API response body.
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
	 *
	 * @throws  {Error}
	 *     When the base URL or endpoint is not a non-empty string.
	 *
	 * @returns  {string}
	 *     The request URL with any query string.
	 */
	function getFinalUrl(endpoint, parameters) {
		if (!isNonEmptyString(baseUrl)) {
			throw new Error(
				`Expected non-empty string <baseUrl>, received ${getFriendlyDisplay(baseUrl)}`,
			);
		}

		// Endpoint without an initial slash.
		const standardisedEndpoint = ltrim(endpoint, "/");

		if (!isNonEmptyString(standardisedEndpoint)) {
			throw new Error(
				`Expected non-empty string <endpoint>, received ${getFriendlyDisplay(endpoint)}`,
			);
		}

		// Serialised query string for requests with parameters.
		const query = isNonEmptyObject(parameters) ? new URLSearchParams(parameters).toString() : "";
		// Request URL before query parameters are appended.
		const url = `${rtrim(baseUrl, "/")}/${standardisedEndpoint}`;

		return [url, query].filter((part) => isNonEmptyString(part)).join("?");
	}

	/**
	 * Get the useful API error body, if the request failed with a response
	 * wrapper.
	 *
	 * @param  {Error|object}  error
	 *     The error thrown by fetch or another runtime failure.
	 *
	 * @returns  {object}
	 *     The response body when the error wraps one, otherwise the error.
	 */
	function getErrorBody(error) {
		if (typeof error?.getResponse !== "function") {
			return error;
		}

		// Response wrapper provided by the thrown error.
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
	 *
	 * @returns  {boolean}
	 *     Whether the error body represents an expired auth session.
	 */
	function isUnauthorisedError(body) {
		return getPropertyValue(body, "code") === unauthorisedErrorCode;
	}

	/**
	 * Reset auth without replacing the original API error.
	 *
	 * Imported dynamically to break a real circular dependency: session-reset
	 * imports the application `useApi` composable, which imports this file. A
	 * static import here would hit that cycle during module initialisation.
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
	 *
	 * @returns  {object|undefined}
	 *     Request headers when a token or JSON body is present.
	 */
	function getHeaders(parameters, method) {
		// Headers added to the API request when needed.
		const headers = {};
		// Auth token from a previous login, if any.
		const storedAuthToken = authToken.value;

		if (isNonEmptyString(storedAuthToken)) {
			headers.Authorization = `Bearer ${storedAuthToken}`;
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
	 *
	 * @returns  {string|undefined}
	 *     The serialised request body for non-GET requests.
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
	 *
	 * @returns  {Promise<object>}
	 *     The parsed API response body.
	 */
	async function remove(endpoint) {
		return makeApiCall("delete", endpoint);
	}

	/**
	 * Get the current base URL.
	 *
	 * @returns  {string}
	 *     The base URL for this composable instance.
	 */
	function getBaseUrl() {
		return baseUrl;
	}

	/**
	 * Update the base URL for this instance.
	 *
	 * @param  {string}  url
	 *     The URL to set.
	 *
	 * @throws  {Error}
	 *     When the URL is not a non-empty string.
	 */
	function setBaseUrl(url) {
		if (!isNonEmptyString(url)) {
			throw new Error(`Expected non-empty string <url>, received ${getFriendlyDisplay(url)}`);
		}

		baseUrl = url;
	}

	/**
	 * Check whether an auth token is currently stored.
	 *
	 * @returns  {boolean}
	 *     Whether an auth token is available.
	 */
	function hasAuthToken() {
		return isNonEmptyString(authToken.value);
	}

	/**
	 * Store the auth token for authenticated requests.
	 *
	 * @param  {string|null}  token
	 *     The token returned from the login endpoint, or null to clear it.
	 */
	function setAuthToken(token) {
		if (isNonEmptyString(token)) {
			authToken.value = token;
		} else {
			authToken.value = null;
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
