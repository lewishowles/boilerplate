<template>
	<router-view />
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "sample-pages-layout",
	meta: {
		breadcrumb: { label: "Sample pages", to: { name: "sample-pages" } },
		page_title: "Sample pages",
	},
});
</script>
