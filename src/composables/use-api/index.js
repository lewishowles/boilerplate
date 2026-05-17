import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { ref } from "vue";

/**
 * Composable for making API calls with centralised baseUrl configuration.
 * Handles fetch requests, error handling, and loading/ready state tracking.
 */
export default function useApi() {
	// Base URL prepended to all API calls—centralises config so callers don't need to know where data comes from
	let baseUrl = "http://localhost:3000/api";

	// Whether fetch is currently in progress
	const isLoading = ref(false);
	// Whether data has loaded successfully
	const isReady = ref(false);

	/**
	 * Perform a GET request to the provided endpoint (with optional query params).
	 * Sets isLoading to true during the request and isReady on success.
	 *
	 * @param  {string}  endpoint
	 *     API endpoint path
	 * @param  {object}  parameters
	 *     Query string parameters
	 */
	async function get(endpoint, parameters) {
		try {
			isLoading.value = true;

			const response = await fetch(getFinalUrl(endpoint, parameters));
			const body = await response.json();

			if (!response.ok) {
				throw new Error(body);
			}

			isReady.value = true;

			return body;
		} finally {
			isLoading.value = false;
		}
	}

	/**
	 * Combine our baseUrl, endpoint and parameters into final URL, serialising
	 * provided query params.
	 *
	 * @param  {string}  endpoint
	 *     Endpoint path to append to baseUrl
	 * @param  {object}  parameters
	 *     Query string parameters
	 */
	function getFinalUrl(endpoint, parameters) {
		if (!isNonEmptyString(baseUrl)) {
			throw new Error(`Expected non-empty string <baseUrl>, received ${getFriendlyDisplay(baseUrl)}`);
		}

		if (!isNonEmptyString(endpoint)) {
			throw new Error(`Expected non-empty string <endpoint>, received ${getFriendlyDisplay(endpoint)}`);
		}

		// Serialise any provided parameters into a query string.
		const query = new URLSearchParams(parameters).toString();

		return [`${baseUrl}/${endpoint}`, query].filter(part => isNonEmptyString(part)).join("?");
	}

	/**
	 * Get the current base URL.
	 */
	function getBaseUrl() {
		return baseUrl;
	}

	/**
	 * Update the base URL for this instance.
	 * Allows runtime config updates without remounting.
	 *
	 * @param  {string}  url
	 *     The URL to set
	 */
	function setBaseUrl(url) {
		if (!isNonEmptyString(url)) {
			throw new Error(`Expected non-empty string <url>, received ${getFriendlyDisplay(url)}`);
		}

		baseUrl = url;
	}

	return {
		isLoading,
		isReady,
		get,
		getBaseUrl,
		setBaseUrl,
	};
}
