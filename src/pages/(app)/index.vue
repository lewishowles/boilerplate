<template>
	<div>Home</div>
</template>

<script setup>
import { definePage } from "vue-router/experimental";

definePage({
	name: "home",
	meta: { title: "Home" },
});
</script>
