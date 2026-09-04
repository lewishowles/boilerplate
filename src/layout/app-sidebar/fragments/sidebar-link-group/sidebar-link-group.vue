<template>
	<section
		class="sidebar-link-group animate-fade-in delay flex flex-col gap-2"
		v-bind="{ 'aria-labelledby': id }"
	>
		<h2 class="text-content-muted px-3 text-xs font-bold tracking-wider uppercase" v-bind="{ id }">
			<slot name="label" />
		</h2>

		<slot />
	</section>
</template>

<script setup>
/**
 * Groups related sidebar links under a labelled section.
 */
import { useId } from "vue";

// The internal ID to link the section to its title.
const id = useId();
</script>
