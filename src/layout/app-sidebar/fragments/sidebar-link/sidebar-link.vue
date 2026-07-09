<template>
	<a
		v-if="isExternal"
		v-bind="{ ...$attrs, href: to }"
		class="flex items-center gap-2"
		target="_blank"
	>
		<component :is="icon" class="size-4" />

		<slot />
	</a>

	<router-link v-else v-slot="{ isExactActive, href, navigate }" v-bind="$props" custom>
		<a
			v-bind="{ ...$attrs, href }"
			class="sidebar-link flex items-center gap-2"
			:class="{ 'sidebar-link--active': isExactActive }"
			:aria-current="isExactActive ? 'page' : undefined"
			@click="navigate"
		>
			<component :is="icon" class="size-4" />

			<slot />
		</a>
	</router-link>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
	...RouterLink.props,

	/**
	 * The icon to use for this menu item.
	 */
	icon: {
		type: Object,
		default: null,
	},
});

defineOptions({
	inheritAttrs: false,
});

// Determine whether this is an external link.
const isExternal = computed(() => {
	return typeof props.to === "string" && props.to.startsWith("http");
});
</script>
