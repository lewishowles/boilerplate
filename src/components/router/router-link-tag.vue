<template>
	<router-link v-bind="{ to }" v-slot="{ isActive, isExactActive, route, href, navigate }" custom>
		<link-tag
			v-bind="{ ...$attrs, href, 'aria-current': isExactActive ? 'page' : undefined }"
			:class="isLinkActive(route, isActive, isExactActive) ? activeClasses : inactiveClasses"
			@click="handleClick($event, navigate, isExactActive)"
		>
			<slot />
		</link-tag>
	</router-link>
</template>

<script setup>
/**
 * Renders a router link with configurable active classes.
 */
import { useRouteReload } from "@/composables/router/use-route-reload";

import { RouterLink } from "vue-router";

defineOptions({
	inheritAttrs: false,
});

// The props to apply to the underlying router-link.
const props = defineProps({
	...RouterLink.props,

	/**
	 * Whether to force a reload, should this link route to the current page.
	 */
	reload: {
		type: Boolean,
		default: false,
	},

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

// Allow this link to reload the current route.
const { reloadRoute } = useRouteReload();

/**
 * Keep parent-route links active on their descendant routes.
 *
 * @param  {object}  route
 *     The route resolved for this link.
 * @param  {boolean}  isActive
 *     Whether the resolved route is active in the current route chain.
 * @param  {boolean}  isExactActive
 *     Whether the resolved route is the current route.
 *
 * @returns  {boolean}
 *     Whether the link should use its active classes.
 */
function isLinkActive(route, isActive, isExactActive) {
	// Home must remain exact because the app shell shares the root route.
	return route.path === "/" ? isExactActive : isActive;
}

/**
 * Handle a router-link click, reloading the current route when requested.
 *
 * @param  {Event}  event
 *     The original click event.
 * @param  {Function}  navigate
 *     The router-link navigation function.
 * @param  {boolean}  isExactActive
 *     Whether the link points to the current route.
 */
function handleClick(event, navigate, isExactActive) {
	if (props.reload && isExactActive) {
		event.preventDefault();

		reloadRoute();

		return;
	}

	navigate(event);
}
</script>
