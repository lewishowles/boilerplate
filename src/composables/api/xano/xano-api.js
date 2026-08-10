import { getPathValue as getPropertyValue, isNonEmptyObject } from "@lewishowles/helpers/object";
import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString, ltrim } from "@lewishowles/helpers/string";
import { ref } from "vue";

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
 * @param  {boolean}  [options.requireGroupId]
 *     Whether the adapter must have a fixed API group ID.
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
	 */
	async function makeApiCall(method, endpoint, parameters) {
		try {
			isLoading.value = true;

			const finalEndpoint = getFinalUrl(endpoint);

			const response = isNonEmptyObject(parameters)
				? await client[method](finalEndpoint, parameters)
				: await client[method](finalEndpoint);

			const body = response.getBody();

			isReady.value = true;

			return body;
		} catch (error) {
			throw getErrorBody(error);
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
	 * Perform a DELETE request.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 */
	async function remove(endpoint) {
		return makeApiCall("delete", endpoint);
	}

	/**
	 * Standardise an endpoint and add the fixed API group when configured.
	 *
	 * @param  {string}  endpoint
	 *     Endpoint path.
	 * @param  {object}  parameters
	 *     Query string parameters.
	 */
	function getFinalUrl(endpoint, parameters) {
		const standardisedEndpoint = ltrim(endpoint, "/");

		if (!isNonEmptyString(standardisedEndpoint)) {
			throw new Error(
				`Expected non-empty string <endpoint>, received ${getFriendlyDisplay(endpoint)}`,
			);
		}

		const path = groupId
			? [`/${groupId}`, standardisedEndpoint].join("/")
			: `/${standardisedEndpoint}`;

		const query = isNonEmptyObject(parameters) ? new URLSearchParams(parameters).toString() : "";

		return [path, query].filter((part) => isNonEmptyString(part)).join("?");
	}

	/**
	 * Get the useful API error body, if the request failed with a Xano response.
	 *
	 * @param  {Error|object}  error
	 *     The error thrown by Xano or another runtime failure.
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

	return {
		delete: remove,
		get,
		getFinalUrl,
		hasAuthToken: () => client.hasAuthToken(),
		isLoading,
		isReady,
		isUnauthorisedError,
		patch,
		post,
		setAuthToken: (authToken) => client.setAuthToken(authToken),
	};
}
