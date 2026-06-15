<template>
	<RouterView />
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	meta: { requiresAuth: true },
});
</script>
