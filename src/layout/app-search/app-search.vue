<template>
	<div class="contents">
		<DefineSearchTemplate v-slot="{ isMobile }">
			<combo-box
				:ref="isMobile ? 'mobile-search' : 'desktop-search'"
				v-model="searchQuery"
				placeholder="Search pages"
				v-bind="{
					align: 'right',
					displayLabel: false,
					dropdownClasses: 'w-full p-2 lg:w-screen lg:max-w-sm',
					items: matchingSearchItems,
					inputAttributes: { 'aria-keyshortcuts': isMac ? 'Meta+K' : 'Control+K' },
					placement: 'bottom',
				}"
				@select="selectSearchItem"
			>
				<template #label>Search</template>

				<template #suffix>
					<kbd v-if="!isMobile" aria-hidden="true" class="flex items-center gap-1">
						<ui-key-cap>{{ isMac ? "⌘" : "Ctrl" }}</ui-key-cap>
						<ui-key-cap>K</ui-key-cap>
					</kbd>
				</template>

				<template #default="{ item: searchItem, highlighted }">
					<span class="flex items-center justify-between">
						{{ searchItem.label }}

						<icon-chevron-right v-if="highlighted" />
					</span>
				</template>

				<template #no-results="{ query }">No pages found for "{{ query }}".</template>
			</combo-box>
		</DefineSearchTemplate>

		<ReuseSearchTemplate
			class="animate-fade-in-left col-start-3 row-start-1 hidden w-full max-w-sm min-w-0 justify-self-end lg:block"
		/>

		<ui-button
			class="button--muted animate-fade-in-left col-start-3 row-start-1 justify-self-end lg:hidden"
			v-bind="{
				'aria-controls': 'app-search-mobile-panel',
				'aria-expanded': showMobileSearch,
				iconOnly: true,
				iconStart: 'icon-search',
			}"
			@click="toggleMobileSearch"
		>
			Search
		</ui-button>

		<div
			v-if="showMobileSearch"
			id="app-search-mobile-panel"
			class="col-span-full row-start-2 w-full lg:hidden"
		>
			<ReuseSearchTemplate v-bind="{ isMobile: true }" class="w-full" />
		</div>
	</div>
</template>

<script setup>
/**
 * Provides search across the authenticated application pages.
 */
import {
	breakpointsTailwind,
	createReusableTemplate,
	onKeyStroke,
	useBreakpoints,
} from "@vueuse/core";

import { computed, nextTick, ref, useTemplateRef } from "vue";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { useRouter } from "vue-router";

// Reusable desktop and mobile search-template components.
const [DefineSearchTemplate, ReuseSearchTemplate] = createReusableTemplate({
	props: {
		isMobile: Boolean,
	},
});

// Router used to open the selected search result.
const router = useRouter();
// The authenticated static pages registered with the router.
const searchItems = createSearchItems(router);
// The current search query.
const searchQuery = ref("");

// The operating system name reported by the browser.
const platform =
	globalThis.navigator?.userAgentData?.platform || globalThis.navigator?.platform || "";

// Whether the search shortcut uses Command instead of Ctrl.
const isMac = platform.toLowerCase().includes("mac");
// The Tailwind screen sizes, matching the lg classes that swap the search
// layouts.
const breakpoints = useBreakpoints(breakpointsTailwind);
// Whether the desktop search field is shown instead of the mobile search
// button.
const isDesktop = breakpoints.greaterOrEqual("lg");

// The registered pages matching the current search query.
const matchingSearchItems = computed(() => {
	if (!isNonEmptyString(searchQuery.value)) {
		return [];
	}

	// Lowercase query used for case-insensitive matching.
	const normalisedQuery = searchQuery.value.toLowerCase();

	return searchItems
		.filter((searchItem) => searchItem.label.toLowerCase().includes(normalisedQuery))
		.sort((firstSearchItem, secondSearchItem) =>
			compareSearchItems(firstSearchItem, secondSearchItem, normalisedQuery),
		);
});

// Whether the mobile search field is open.
const showMobileSearch = ref(false);
// The desktop combo-box instance focused by the search shortcut.
const desktopSearch = useTemplateRef("desktop-search");
// The mobile combo-box instance used to restore focus after opening.
const mobileSearch = useTemplateRef("mobile-search");

// Focus page search on Cmd+K (macOS) or Ctrl+K. On smaller screens this opens
// the mobile search field, or focuses it if it is already open.
onKeyStroke(
	(event) => {
		// Whether the platform shortcut modifier key is held.
		const modifierPressed = isMac ? event.metaKey : event.ctrlKey;

		return modifierPressed && !event.altKey && !event.shiftKey && event.key?.toLowerCase() === "k";
	},
	(event) => {
		event.preventDefault();

		if (isDesktop.value) {
			desktopSearch.value?.triggerFocus();

			return;
		}

		if (!showMobileSearch.value) {
			toggleMobileSearch();

			return;
		}

		mobileSearch.value?.triggerFocus();
	},
);

/**
 * Open or close the mobile search field and focus it when it opens.
 */
async function toggleMobileSearch() {
	showMobileSearch.value = !showMobileSearch.value;

	if (showMobileSearch.value) {
		await nextTick();
		mobileSearch.value?.triggerFocus();
	}
}

/**
 * Navigate to the selected starter page.
 *
 * @param  {object}  searchItem
 *     The selected page search item.
 */
async function selectSearchItem(searchItem) {
	await router.push(searchItem.to);

	searchQuery.value = "";
	showMobileSearch.value = false;
}

/**
 * Compare two pages whose titles contain the query, for sorting the closest
 * match first. The shorter title comes first; when both are the same length,
 * the title where the query starts earlier comes first. Equally close pages
 * return zero, so the stable sort keeps them in route order.
 *
 * @param  {object}  firstSearchItem
 *     A matching page, as built by `createSearchItems`.
 * @param  {object}  secondSearchItem
 *     The matching page to compare it with.
 * @param  {string}  normalisedQuery
 *     The search query in lowercase.
 *
 * @returns  {number}
 *     Negative when the first page is closer, positive when the second is
 *     closer, or zero when they are equally close.
 */
function compareSearchItems(firstSearchItem, secondSearchItem, normalisedQuery) {
	// The first page's title in lowercase, so the query is found regardless of
	// case.
	const firstLabel = firstSearchItem.label.toLowerCase();
	// The second page's title in lowercase, so the query is found regardless of
	// case.
	const secondLabel = secondSearchItem.label.toLowerCase();

	if (firstLabel.length !== secondLabel.length) {
		return firstLabel.length - secondLabel.length;
	}

	return firstLabel.indexOf(normalisedQuery) - secondLabel.indexOf(normalisedQuery);
}

/**
 * Build search items from registered authenticated routes that do not need
 * parameters.
 *
 * @param  {object}  routerInstance
 *     The application router.
 *
 * @returns  {object[]}
 *     Searchable page items.
 */
function createSearchItems(routerInstance) {
	return routerInstance
		.getRoutes()
		.filter((route) => {
			return (
				route.name &&
				!route.redirect &&
				!route.path.includes(":") &&
				!route.path.includes("*") &&
				isNonEmptyString(route.meta.page_title) &&
				routerInstance.resolve({ name: route.name }).meta.requiresAuth
			);
		})
		.map((route) => ({
			label: route.meta.page_title,
			to: { name: route.name },
		}));
}
</script>
