import { isNonEmptyString } from "@lewishowles/helpers/string";
import { useTitle } from "@vueuse/core";
import { onScopeDispose, toValue, watchEffect } from "vue";
import { useRoute } from "vue-router";

// Captured at module load time so it always reflects the original value set in
// index.html.
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
	// `page_title`, followed by the route's base title.
	watchEffect(() => {
		documentTitle.value = getPageTitle(
			toValue(title) || route.meta?.page_title,
			route.meta?.base_title,
		);
	});

	onScopeDispose(() => {
		documentTitle.value = getPageTitle(route.meta?.page_title, route.meta?.base_title);
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

	// Keep the document title synced to the route `page_title` and base title.
	watchEffect(() => {
		documentTitle.value = getPageTitle(route.meta?.page_title, route.meta?.base_title);
	});
}

/**
 * Determine the appropriate page title, combining any provided title with the
 * base title.
 *
 * @param  {string}  title
 *     The title to set.
 * @param  {string}  baseTitle
 *     The route's `base_title`, used in place of the title from index.html when
 *     it is a non-empty string.
 *
 * @returns  {string}
 *     The title combined with the base title, or the base title alone when
 *     there is no title.
 */
function getPageTitle(title, baseTitle) {
	// Routes without their own base title use the title from index.html.
	const resolvedBaseTitle = isNonEmptyString(baseTitle) ? baseTitle : BASE_TITLE;

	if (!isNonEmptyString(title)) {
		return resolvedBaseTitle;
	}

	return `${title} | ${resolvedBaseTitle}`;
}
