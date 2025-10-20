import { getFriendlyDisplay } from "@lewishowles/helpers/general";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { ref } from "vue";

/**
 * Simplify the process of making API calls by removing some of the boilerplate.
 */
export default function useApi() {
	// Whether data is currently loading.
	const isLoading = ref(false);
	// Whether data has loaded successfully.
	const isReady = ref(false);

	/**
	 * Perform a GET request to the provided URL.
	 *
	 * @param  {string}  url
	 *     The URL from which to load data.
	 */
	async function get(url) {
		try {
			isLoading.value = true;

			if (!isNonEmptyString(url)) {
				throw new Error(`Expected non-empty string <url>, received ${getFriendlyDisplay(url)}`);
			}

			let response = await fetch(url);

			response = response.json();

			isReady.value = true;

			return response;
		} finally {
			isLoading.value = false;
		}
	}

	return {
		isLoading,
		isReady,
		get,
	};
}
