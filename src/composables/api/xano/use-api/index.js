import { get as getPropertyValue, isNonEmptyObject } from "@lewishowles/helpers/object";
import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString, ltrim } from "@lewishowles/helpers/string";
import { ref } from "vue";
import { xano } from "@/composables/api/xano/xano-client";

// API error code returned when the current request is not authorised.
const unauthorisedErrorCode = "ERROR_CODE_UNAUTHORIZED";

/**
 * Composable for making API calls with Xano.
 */
export default function useApi() {
	// Whether fetch is currently in progress.
	const isLoading = ref(false);
	// Whether data has loaded successfully.
	const isReady = ref(false);

	/**
	 * Perform an API request.
	 *
	 * @param  {string}  method
	 *     The method to call, one of get, post, put, patch, delete.
	 * @param  {string}  endpoint
	 *     API endpoint path.
	 * @param  {object}  parameters
	 *     Query string parameters or request body.
	 */
	async function makeApiCall(method, endpoint, parameters) {
		let finalEndpoint;

		try {
			isLoading.value = true;

			finalEndpoint = getFinalUrl(endpoint);

			let response;

			if (isNonEmptyObject(parameters)) {
				response = await xano[method](finalEndpoint, parameters);
			} else {
				response = await xano[method](finalEndpoint);
			}

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
	 * Standardise the provided endpoint and serialise query parameters.
	 *
	 * @param  {string}  endpoint
	 *     Endpoint path to request.
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

		if (!isNonEmptyObject(parameters)) {
			return `/${standardisedEndpoint}`;
		}

		const query = new URLSearchParams(parameters).toString();

		return [`/${standardisedEndpoint}`, query].filter((part) => isNonEmptyString(part)).join("?");
	}

	/**
	 * Check whether an auth token is currently stored.
	 */
	function hasAuthToken() {
		return xano.hasAuthToken();
	}

	/**
	 * Store the Xano auth token for authenticated requests.
	 *
	 * @param  {string|null}  authToken
	 *     The token returned from the login endpoint, or null to clear it.
	 */
	function setAuthToken(authToken) {
		xano.setAuthToken(authToken);
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
		get,
		getFinalUrl,
		hasAuthToken,
		isLoading,
		isReady,
		isUnauthorisedError,
		patch,
		post,
		setAuthToken,
	};
}
