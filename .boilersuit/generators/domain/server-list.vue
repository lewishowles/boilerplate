<template>
	<page-title>
		{{ NAME | pascal }}

		<template #introduction>Browse {{ NAME | lower }}</template>

		<template #actions>
			<router-link-tag
				v-bind="{ to: { name: '{{ NAME | kebab }}-create' } }"
				class="button--muted animate-fade-in-left delay"
				icon-start="icon-plus"
			>
				Add {{ SINGULAR_NAME | lower }}
			</router-link-tag>
		</template>
	</page-title>

	<loading-indicator v-if="isInitialLoading" v-bind="{ large: true }">
		Loading {{ NAME | lower }}…
	</loading-indicator>

	<content-card v-else-if="isReady">
		<content-card-section>
			<data-table
				v-model:state="tableState"
				mode="server"
				name="{{ NAME | kebab }}"
				v-bind="{ columns, data: {{ NAME | camel }}, error, loading: isRefreshing, totalRows }"
			>
				<template #search-label>Search {{ NAME | lower }}</template>
				<template #no-data-message>No {{ NAME | lower }} to display</template>

				<template #actions="{ row }">
					<router-link-tag v-bind="{ to: { name: '{{ NAME | kebab }}-edit', params: { {{ ID_NAME }}: row.id } } }">
						View
						<span class="sr-only" v-text="row.name" />
					</router-link-tag>
				</template>
			</data-table>
		</content-card-section>

		<content-card-footer class="justify-end">
			<p class="flex shrink-0 gap-2">
				<span>Last updated</span>
				<relative-date v-bind="{ date: lastFetched }" />
			</p>

			<ui-button
				class="button--muted"
				icon-start="icon-reload"
				v-bind="{ reactive: true }"
				@click="refetch"
			>
				Refresh
			</ui-button>
		</content-card-footer>
	</content-card>

	<div v-else-if="error" class="space-y-4">
		<p role="alert">Unable to load {{ NAME | lower }}.</p>

		<ui-button class="button--muted" v-bind="{ reactive: true }" @click="refetch">
			Try again
		</ui-button>
	</div>
</template>

<script setup>
/**
 * Displays the {{ NAME | kebab }} list with server-side table controls.
 */
import { computed } from "vue";
import { definePage } from "vue-router/experimental";
import { use{{ NAME | pascal }}Table } from "@/composables/{{ NAME | kebab }}";

// Load the table state and the list the page shows.
const {
	error,
	{{ NAME | camel }},
	isInitialLoading,
	isReady,
	isRefreshing,
	lastFetched,
	page,
	refetch,
	search,
	sort,
	totalRows,
} = use{{ NAME | pascal }}Table();

// Translate the table composable refs into the data-table state.
const tableState = computed({
	/**
	 * Convert the table controls into the data-table state.
	 *
	 * @returns  {object}
	 *     The data-table state.
	 */
	get: () => ({
		filters: {
			search: search.value,
		},
		// The page size is fixed at 10 and must match the API's page size.
		itemsPerPage: 10,
		page: page.value,
		sort: sort.value,
	}),
	/**
	 * Apply data-table changes to the table controls.
	 *
	 * @param  {object}  nextState
	 *     The new data-table state.
	 */
	set: (nextState) => {
		page.value = nextState.page;
		search.value = nextState.filters?.search ?? "";
		sort.value = nextState.sort ?? null;
	},
});

// Show the record name as the only starter table column.
const columns = {
	name: {
		label: "Name",
		sortable: false,
	},
};

definePage({
	name: "{{ NAME | kebab }}",
	meta: { page_title: "{{ NAME | pascal }}" },
});
</script>
