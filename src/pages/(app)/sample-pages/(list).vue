<template>
	<page-title>Sample pages</page-title>
</template>

<script setup>
/**
 * Displays the sample-page list.
 */
import { definePage } from "vue-router/experimental";

definePage({
	name: "sample-pages",
	meta: { page_title: "Sample pages" },
});
</script>
