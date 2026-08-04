<template>
	<page-title>Home</page-title>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "home",
	meta: { title: "Home" },
});
</script>
