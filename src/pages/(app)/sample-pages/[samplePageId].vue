<template>
	<page-title>Sample page</page-title>
</template>

<script setup>
/**
 * Displays a sample page by its route identifier.
 */
import { useBreadcrumb } from "@/composables/router/use-breadcrumbs";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { definePage } from "vue-router/experimental";

// The current route provides the sample page identity.
const route = useRoute();
// The current sample page identifier shown in the breadcrumb.
const samplePageId = computed(() => route.params.samplePageId);

useBreadcrumb(() => `Sample ${samplePageId.value}`);

definePage({
	name: "sample-page",
	meta: { page_title: "Sample page" },
});
</script>
