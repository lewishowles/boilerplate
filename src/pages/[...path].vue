<template>
	<div class="flex min-h-screen flex-col items-center justify-center gap-4">
		<h1 class="text-4xl font-bold">404</h1>
		<p class="text-content-muted">Page not found</p>
		<RouterLink to="/" class="text-primary hover:underline">Go back home</RouterLink>
	</div>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { definePage } from "vue-router/experimental";

definePage({
	name: "not-found",
});
</script>
