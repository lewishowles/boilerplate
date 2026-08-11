<template>
	<router-view />
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "section-one-layout",
	redirect: { name: "page-two" },
	meta: {
		breadcrumb: { label: "Page two", to: { name: "page-two" } },
		page_title: "Page two",
	},
});
</script>
