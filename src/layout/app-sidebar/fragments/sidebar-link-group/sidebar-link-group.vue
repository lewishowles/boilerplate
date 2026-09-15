<template>
	<section
		class="sidebar-link-group animate-fade-in delay flex flex-col gap-2"
		v-bind="{ 'aria-labelledby': id }"
	>
		<h2 class="text-content-muted px-3 text-sm" v-bind="{ id }">
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
import { useMenuGroup } from "@/composables/router/use-menu";

// The internal ID to link the section to its title.
const id = useId();

useMenuGroup();
</script>
