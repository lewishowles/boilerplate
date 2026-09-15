<template>
	<loading-indicator v-if="isInitialLoading" v-bind="{ large: true }">
		Loading {{ NAME | lower }}…
	</loading-indicator>

	<template v-else-if="isReady">
		<data-table
			v-model:state="tableState"
			mode="server"
			name="{{ NAME | kebab }}"
			v-bind="{ columns, data: items, error, loading: isRefreshing, totalRows }"
		>
			<template #table-title>{{ NAME | lower }}</template>
			<template #table-introduction>Browse {{ NAME | lower }}</template>
			<template #search-label>Search {{ NAME | lower }}</template>
			<template #search-introduction>Find {{ NAME | lower }}</template>
			<template #no-data-message>No {{ NAME | lower }} to display</template>
		</data-table>

		<div class="mbs-10 flex items-center justify-end gap-4">
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
		</div>
	</template>

	<div v-else-if="error" class="space-y-4">
		<p role="alert">Unable to load {{ NAME | lower }}.</p>

		<ui-button class="button--muted" v-bind="{ reactive: true }" @click="refetch">
			Try again
		</ui-button>
	</div>
</template>

<script setup>
/**
 * Render a server-backed table page for the {{ NAME | kebab }} records.
 */
import { computed } from "vue";
import { definePage } from "vue-router/experimental";
import { use{{ NAME | pascal }}Table } from "@/composables/{{ NAME | kebab }}";

// State and actions for the table query.
const {
	error,
	isInitialLoading,
	isReady,
	isRefreshing,
	items,
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
	 * Return the table state shown by the data-table component.
	 *
	 * @returns  {object}
	 *     The current filters, items per page, page, and sort state.
	 */
	get: () => ({
		filters: {
			search: search.value,
		},
		itemsPerPage: 10,
		page: page.value,
		sort: sort.value,
	}),
	/**
	 * Apply table controls selected by the data-table component.
	 *
	 * @param  {object}  nextState
	 *     The updated filters, page, and sort state.
	 */
	set: (nextState) => {
		page.value = nextState.page;
		search.value = nextState.filters?.search ?? null;
		sort.value = nextState.sort ?? null;
	},
});

// Column definitions for the data table.
const columns = {
	name: {
		label: "Name",
		primary: true,
	},
};

definePage({
	name: "{{ NAME | kebab }}",
});
</script>
