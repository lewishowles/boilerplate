<template>
	<modal-controller />

	<RouterView v-slot="{ Component }">
		<component :is="Component" :key="routeKey" />
	</RouterView>
</template>

<script setup>
/**
 * Sets up application-wide page-title updates.
 */
import { usePageTitles } from "@/composables/router/use-page-title";
import { useRouteReload } from "@/composables/router/use-route-reload";
import { RouterView } from "vue-router";

// Allow components to force a re-render for the current page.
const { routeKey } = useRouteReload();

// Allow pages to define their own titles.
usePageTitles();
</script>
