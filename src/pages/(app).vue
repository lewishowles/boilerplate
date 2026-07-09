<template>
	<a href="#main" class="sr-only focus-visible:not-sr-only">Skip to main content</a>

	<div class="flex min-h-screen">
		<app-sidebar />

		<main id="main" class="grow">
			<RouterView />
		</main>
	</div>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	meta: { requiresAuth: true },
});
</script>
