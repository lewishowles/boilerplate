<template>
	<section class="flex flex-col gap-2" v-bind="{ 'aria-labelledby': id }">
		<h2 v-bind="{ id }">
			<slot name="label" />
		</h2>

		<slot />
	</section>
</template>

<script setup>
import { useId } from "vue";

// The internal ID to link the section to its title.
const id = useId();
</script>
