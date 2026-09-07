import { ref } from "vue";

// Shared across all consumers so every router-link reload stays in sync.
const routeKey = ref(0);

/**
 * Provide a route key that can be bumped to force a reload of the current
 * route.
 *
 * @returns  {object}
 *     The reactive route key and a function to reload the current route.
 */
export function useRouteReload() {
	/**
	 * Bump the shared route key to force route-dependent content to remount.
	 */
	function reloadRoute() {
		routeKey.value++;
	}

	return { routeKey, reloadRoute };
}
