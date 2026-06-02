import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { isNonEmptyString, ltrim, rtrim } from "@lewishowles/helpers/string";
import { ref } from "vue";

// Base URL prepended to all API calls.
const defaultBaseUrl = "{{ API_BASE_URL }}";

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
		try {
			isLoading.value = true;

			const response = await fetch(getFinalUrl(endpoint, method === "get" ? parameters : undefined), {
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
			throw new Error(`Expected non-empty string <baseUrl>, received ${getFriendlyDisplay(baseUrl)}`);
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
	 * Return JSON headers when a request body is present.
	 *
	 * @param  {object}  parameters
	 *     Request body parameters.
	 * @param  {string}  method
	 *     The HTTP method to use.
	 */
	function getHeaders(parameters, method) {
		if (method === "get" || !isNonEmptyObject(parameters)) {
			return undefined;
		}

		return {
			"Content-Type": "application/json",
		};
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

	return {
		get,
		getBaseUrl,
		getFinalUrl,
		isLoading,
		isReady,
		patch,
		post,
		setBaseUrl,
	};
}
