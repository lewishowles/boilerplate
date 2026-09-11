import { getPathValue as getPropertyValue, isNonEmptyObject } from "@lewishowles/helpers/object";
import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString, ltrim } from "@lewishowles/helpers/string";
import { ref } from "vue";

import translateSortParameters from "./translate-sort-parameters";

// API error code returned when the current request is not authorised.
const unauthorisedErrorCode = "ERROR_CODE_UNAUTHORIZED";

/**
 * Create an API helper around a shared Xano client.
 *
 * @param  {object}  options
 *     Client and optional fixed API group configuration.
 * @param  {object}  options.client
 *     Xano client instance.
 * @param  {string}  [options.groupId]
 *     Fixed API group ID for an instance-based client.
 * @param  {boolean}  [options.requireGroupId=false]
 *     Whether the adapter must have a fixed API group ID.
 *
 * @throws  {Error}
 *     When the Xano client or required group ID is missing.
 *
 * @returns  {object}
 *     API methods and reactive request state for the Xano client.
 */
export default function createXanoApi({ client, groupId, requireGroupId = false } = {}) {
	if (!client) {
		throw new Error("Expected a Xano client");
	}

	if ((requireGroupId || groupId !== undefined) && !isNonEmptyString(groupId)) {
		throw new Error(`Expected non-empty string <groupId>, received ${getFriendlyDisplay(groupId)}`);
	}

	// Whether the current request is in progress.
	const isLoading = ref(false);
	// Whether data has loaded successfully.
	const isReady = ref(false);

	/**
	 * Perform an API request.
	 *
	 * @param  {string}  method
	 *     The method to call.
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Query string parameters or request body.
	 *
	 * @throws  {object}
	 *     The normalised Xano error body when the request fails.
	 *
	 * @returns  {Promise<object>}
	 *     The parsed Xano response body.
	 */
	async function makeApiCall(method, endpoint, parameters) {
		// URL used for the in-progress Xano request.
		let finalEndpoint;

		try {
			isLoading.value = true;

			finalEndpoint = getFinalUrl(endpoint);

			// Get our request parameters. We only translate sort parameters on
			// GET where
			// it's needed.
			const requestParameters = method === "get" ? translateSortParameters(parameters) : parameters;

			// Xano response returned by the requested client method.
			const response = isNonEmptyObject(requestParameters)
				? await client[method](finalEndpoint, requestParameters)
				: await client[method](finalEndpoint);

			// Parsed response body returned to the caller.
			const body = response.getBody();

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
	 *     The parsed Xano response body.
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
	 *     The parsed Xano response body.
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
	 *     The parsed Xano response body.
	 */
	async function patch(endpoint, parameters) {
		return makeApiCall("patch", endpoint, parameters);
	}

	/**
	 * Perform a DELETE request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 *
	 * @returns  {Promise<object>}
	 *     The parsed Xano response body.
	 */
	async function remove(endpoint) {
		return makeApiCall("delete", endpoint);
	}

	/**
	 * Standardise an endpoint and add the fixed API group when configured.
	 *
	 * @param  {string}  endpoint
	 *     Endpoint path.
	 *
	 * @throws  {Error}
	 *     When the endpoint is not a non-empty string.
	 *
	 * @returns  {string}
	 *     The endpoint with its fixed group.
	 */
	function getFinalUrl(endpoint) {
		// Endpoint without an initial slash.
		const standardisedEndpoint = ltrim(endpoint, "/");

		if (!isNonEmptyString(standardisedEndpoint)) {
			throw new Error(
				`Expected non-empty string <endpoint>, received ${getFriendlyDisplay(endpoint)}`,
			);
		}

		// Request path with the fixed group when one is configured.
		const path = groupId
			? [`/${groupId}`, standardisedEndpoint].join("/")
			: `/${standardisedEndpoint}`;

		return path;
	}

	/**
	 * Get the useful API error body, if the request failed with a Xano
	 * response.
	 *
	 * @param  {Error|object}  error
	 *     The error thrown by Xano or another runtime failure.
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
	 * imports the application `useApi` composable, which imports the group
	 * API composable, which imports this file. A static import here would
	 * hit that cycle during module initialisation.
	 */
	function resetAuthSessionSilently() {
		import("@/composables/api/session-reset")
			.then(({ resetAuthSession }) => resetAuthSession().catch(() => null))
			.catch(() => null);
	}

	return {
		delete: remove,
		get,
		getFinalUrl,
		/**
		 * Check whether the Xano client has an auth token.
		 *
		 * @returns  {boolean}
		 *     Whether an auth token is available.
		 */
		hasAuthToken: () => client.hasAuthToken(),
		isLoading,
		isReady,
		isUnauthorisedError,
		patch,
		post,
		/**
		 * Store the auth token through the Xano client.
		 *
		 * @param  {string|null}  authToken
		 *     The token to store, or null to clear it.
		 *
		 * @returns  {object}
		 *     The Xano client, which its `setAuthToken` returns for chaining.
		 */
		setAuthToken: (authToken) => client.setAuthToken(authToken),
	};
}
