<template>
	<page-title>
		Page two

		<template #introduction>Placeholder content for page two.</template>
	</page-title>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "page-two",
	meta: { page_title: "Page two" },
});
</script>
