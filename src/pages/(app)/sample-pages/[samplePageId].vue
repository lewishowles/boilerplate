<template>
	<page-title>Sample page</page-title>
</template>

<script setup>
import { computed } from "vue";
import { definePage } from "vue-router/experimental";
import { useRoute } from "vue-router";
import { useBreadcrumb } from "@/composables/router/use-breadcrumbs";

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
