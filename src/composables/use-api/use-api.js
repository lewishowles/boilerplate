import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { ref } from "vue";

/**
 * Simplify the process of making API calls by removing some of the boilerplate.
 */
export default function useApi() {
	// Our base URL, which is prepended to API calls. We do this so that the
	// rest of the app doesn't have to think about where data comes from.
	let baseUrl = "http://localhost:3000/api";

	// Whether data is currently loading.
	const isLoading = ref(false);
	// Whether data has loaded successfully.
	const isReady = ref(false);

	/**
	 * Perform a GET request to the provided endpoint, combined with a known
	 * base path.
	 *
	 * @param  {string}  endpoint
	 *     The endpoint from which to load data.
	 * @param  {object}  parameters
	 *     Any parameters to add as a query string.
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
	 * Combine the provided endpoint and the base URL to create our final URL to
	 * call.
	 *
	 * @param  {string}  endpoint
	 *     The endpoint for a single call, to be appended to the base URL.
	 * @param  {object}  parameters
	 *     Any parameters to add as a query string.
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
	 * Retrieve the current base URL.
	 */
	function getBaseUrl() {
		return baseUrl;
	}

	/**
	 * Update the default base URL for this instance of the composable.
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
		isLoading,
		isReady,
		get,
		getBaseUrl,
		setBaseUrl,
	};
}
