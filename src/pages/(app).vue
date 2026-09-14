<template>
	<a href="#main" class="sr-only focus-visible:not-sr-only">Skip to main content</a>

	<div class="text-content grid min-h-screen grid-cols-[auto_minmax(0,1fr)]">
		<app-sidebar />

		<div
			class="app-shell min-w-0 max-lg:col-span-full"
			:class="{ 'col-span-full': !showSidebar, 'col-start-2': showSidebar }"
		>
			<app-title-bar />

			<main id="main" class="app-main bg-surface-subtle pb-4">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup>
/**
 * Renders the authenticated application shell.
 */
import { definePage } from "vue-router/experimental";
import { useSidebar } from "@/composables/layout/use-sidebar";

// The app shell expands into the sidebar column when navigation is closed.
const { showSidebar } = useSidebar();

definePage({
	meta: { requiresAuth: true },
});
</script>
