import { isNonEmptyString } from "@lewishowles/helpers/string";
import { onScopeDispose, toValue, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useTitle } from "@vueuse/core";

// Captured at module load time so it always reflects the original value set
// in index.html.
const BASE_TITLE = document.title;

/**
 * Set the document title for the current page.
 *
 * @param  {string|object|Function}  title
 *     The title, ref, computed, or getter to display.
 */
export function usePageTitle(title) {
	// Current route used as the fallback title source.
	const route = useRoute();
	// Reactive browser document title.
	const documentTitle = useTitle();

	// Keep the document title synced to an explicit title or route
	// `page_title`.
	watchEffect(() => {
		documentTitle.value = getPageTitle(toValue(title) || route.meta?.page_title);
	});

	onScopeDispose(() => {
		documentTitle.value = getPageTitle(route.meta?.page_title);
	});
}

/**
 * Apply the document title reactively from the current route's meta, falling
 * back to the base title. Intended to be called once from the app layout.
 */
export function usePageTitles() {
	// Current route used as the document title source.
	const route = useRoute();
	// Reactive browser document title.
	const documentTitle = useTitle();

	// Keep the document title synced to the route `page_title`.
	watchEffect(() => {
		documentTitle.value = getPageTitle(route.meta?.page_title);
	});
}

/**
 * Determine the appropriate page title, combining any provided title with the
 * base title.
 *
 * @param  {string}  title
 *     The title to set.
 *
 * @returns  {string}
 *     Title combined with the base application title.
 */
function getPageTitle(title) {
	if (!isNonEmptyString(title)) {
		return BASE_TITLE;
	}

	return `${title} | ${BASE_TITLE}`;
}
