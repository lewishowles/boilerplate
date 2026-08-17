<template>
	<router-link v-bind="{ to }" v-slot="{ isActive, isExactActive, route, href, navigate }" custom>
		<link-tag
			v-bind="{ ...$attrs, href, 'aria-current': isExactActive ? 'page' : undefined }"
			:class="isLinkActive(route, isActive, isExactActive) ? activeClasses : inactiveClasses"
			@click="navigate"
		>
			<slot />
		</link-tag>
	</router-link>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

defineOptions({
	inheritAttrs: false,
});

const props = defineProps({
	...RouterLink.props,

	/**
	 * Any classes to apply when the link is active.
	 */
	activeClasses: {
		type: String,
		default: null,
	},

	/**
	 * Any classes to apply when the link is not active.
	 */
	inactiveClasses: {
		type: String,
		default: null,
	},
});

/**
 * Keep parent-route links active on their descendant routes.
 *
 * @param  {object}  route
 *     The route resolved for this link.
 * @param  {boolean}  isActive
 *     Whether the resolved route is active in the current route chain.
 * @param  {boolean}  isExactActive
 *     Whether the resolved route is the current route.
 */
function isLinkActive(route, isActive, isExactActive) {
	// Home must remain exact because the app shell shares the root route.
	return route.path === "/" ? isExactActive : isActive;
}
</script>
