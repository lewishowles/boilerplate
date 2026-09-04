<template>
	<div class="contents">
		<DefineSearchTemplate v-slot="{ mobile }">
			<combo-box
				:ref="mobile ? 'mobile-search' : undefined"
				v-model="searchQuery"
				placeholder="Search pages"
				v-bind="{
					align: 'right',
					displayLabel: false,
					dropdownClasses: 'w-full p-2 lg:w-screen lg:max-w-sm',
					items: matchingSearchItems,
					placement: 'bottom',
				}"
				@select="selectSearchItem"
			>
				<template #label>Search</template>

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
			<ReuseSearchTemplate v-bind="{ mobile: true }" class="w-full" />
		</div>
	</div>
</template>

<script setup>
/**
 * Provides search across the authenticated application pages.
 */
import { computed, nextTick, ref, useTemplateRef } from "vue";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { createReusableTemplate } from "@vueuse/core";
import { useRouter } from "vue-router";

// Reusable desktop and mobile search-template components.
const [DefineSearchTemplate, ReuseSearchTemplate] = createReusableTemplate({
	props: {
		mobile: Boolean,
	},
});

// Router used to open the selected search result.
const router = useRouter();
// The authenticated static pages registered with the router.
const searchItems = createSearchItems(router);
// The current search query.
const searchQuery = ref("");

// The registered pages matching the current search query.
const matchingSearchItems = computed(() => {
	if (!isNonEmptyString(searchQuery.value)) {
		return [];
	}

	// Lowercase query used for case-insensitive matching.
	const normalisedQuery = searchQuery.value.toLowerCase();

	return searchItems.filter((searchItem) =>
		searchItem.label.toLowerCase().includes(normalisedQuery),
	);
});

// Whether the mobile search field is open.
const showMobileSearch = ref(false);
// The mobile combo-box instance used to restore focus after opening.
const mobileSearch = useTemplateRef("mobile-search");

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
