<template>
	<a href="#main" class="sr-only focus-visible:not-sr-only">Skip to main content</a>

	<div class="flex min-h-screen">
		<app-sidebar />

		<div class="app-shell w-full grow">
			<app-title-bar />

			<main id="main" class="app-main pb-4">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	meta: { requiresAuth: true },
});
</script>
