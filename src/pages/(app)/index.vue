<template>
	<page-title>
		Page one

		<template #introduction>Placeholder content for page one.</template>
	</page-title>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "page-one",
	meta: { breadcrumb: { label: "Page one" }, page_title: "Page one" },
});
</script>
