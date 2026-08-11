<template>
	<page-title>
		Page three

		<template #introduction>Placeholder content for page three.</template>
	</page-title>
</template>

<script setup>
import { computed } from "vue";
import { definePage } from "vue-router/experimental";
import { useRoute } from "vue-router";
import { useBreadcrumb } from "@/composables/router/use-breadcrumbs";

// The current route provides the example record identity.
const route = useRoute();

// The current record identifier shown in the breadcrumb.
const recordId = computed(() => route.params.recordId);

useBreadcrumb(() => `Record ${recordId.value}`);

definePage({
	name: "page-three",
	meta: { page_title: "Page three" },
});
</script>
