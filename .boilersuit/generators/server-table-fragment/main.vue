{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
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
import { computed } from "vue";
import { definePage } from "vue-router/experimental";

import { use{{ COMPOSABLE_NAME }}Table } from "@/composables/{{ NAME | kebab }}";

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
} = use{{ COMPOSABLE_NAME }}Table();

// Translate the table composable refs into the data-table state contract.
const tableState = computed({
	get: () => ({
		filters: {
			search: search.value,
		},
		itemsPerPage: 10,
		page: page.value,
		sort: sort.value,
	}),
	set: (nextState) => {
		page.value = nextState.page;
		search.value = nextState.filters?.search ?? "";
		sort.value = nextState.sort ?? null;
	},
});

const columns = {
	name: {
		label: "Name",
		sortable: false,
	},
};

definePage({
	name: "{{ NAME | kebab }}",
	meta: { requiresAuth: true },
});
</script>
