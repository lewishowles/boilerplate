<template>
	<loading-indicator v-if="isInitialLoading" v-bind="{ large: true }">
		Loading {{ NAME | lower }}…
	</loading-indicator>

	<template v-else-if="isReady">
		<data-table
			name="{{ NAME | kebab }}"
			v-bind="{ data: {{ NAME }}, columns }"
		>
			<template #table-title>{{ NAME | lower }}</template>
			<template #table-introduction>Browse {{ NAME | lower }}</template>
			<template #search-label>Search {{ NAME | lower }}</template>
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
import { definePage } from "vue-router/experimental";
import { use{{ NAME | pascal }} } from "@/queries/{{ NAME | kebab }}";

const { error, isInitialLoading, isReady, lastFetched, refetch, {{ NAME }} } =
	use{{ NAME | pascal }}();

const columns = {
	name: {
		label: "Name",
	},
};

definePage({
	name: "{{ NAME | kebab }}",
});
</script>
