<template>
	<a
		v-if="isExternal"
		v-bind="{ ...$attrs, href: to }"
		class="text-content hocus:bg-surface-sunken hocus:text-content-strong hocus:underline flex items-center gap-3 rounded-lg px-3 py-2 no-underline"
		target="_blank"
	>
		<component :is="icon" class="size-4" />

		<slot />
	</a>

	<router-link
		v-else
		v-slot="{ isActive, isExactActive, route, href, navigate }"
		v-bind="$props"
		custom
	>
		<a
			v-bind="{ ...$attrs, href }"
			class="text-content hocus:bg-surface-sunken hocus:text-content-strong hocus:underline flex items-center gap-3 rounded-lg px-3 py-2 no-underline"
			:class="{
				'bg-primary-subtle text-primary font-semibold': isLinkActive(
					route,
					isActive,
					isExactActive,
				),
			}"
			:aria-current="isLinkActive(route, isActive, isExactActive) ? 'page' : undefined"
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

/**
 * Keep parent-route links active on their descendant routes while leaf links
 * only match their exact route.
 *
 * @param {object} route
 *     The route resolved for this link.
 * @param {boolean} isActive
 *     Whether the resolved route is active in the current route chain.
 * @param {boolean} isExactActive
 *     Whether the resolved route is the current route.
 */
function isLinkActive(route, isActive, isExactActive) {
	return route.matched.at(-1)?.children?.length ? isActive : isExactActive;
}

// Determine whether this is an external link.
const isExternal = computed(() => {
	return typeof props.to === "string" && props.to.startsWith("http");
});
</script>
