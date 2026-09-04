<template>
	<modal-controller />

	<RouterView />
</template>

<script setup>
/**
 * Sets up application-wide page-title updates.
 */
import { usePageTitles } from "@/composables/router/use-page-title";
import { RouterView } from "vue-router";

// Allow pages to define their own titles.
usePageTitles();
</script>
