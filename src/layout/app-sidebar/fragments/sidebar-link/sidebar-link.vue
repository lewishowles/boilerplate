<template>
	<link-tag
		v-if="isExternal"
		v-bind="{ ...$attrs, href: to }"
		class="text-content hocus:bg-surface-sunken hocus:text-content-strong hocus:underline flex w-full items-center gap-3 rounded-lg px-3 py-2 no-underline"
		target="_blank"
	>
		<component :is="icon" class="size-4" />

		<slot />
	</link-tag>

	<router-link-tag
		v-else
		v-bind="{ ...routerLinkProps, ...$attrs, class: menuItemClasses, 'icon-start': icon }"
		class="text-content hocus:bg-surface-sunken hocus:text-content-strong hocus:underline flex w-full items-center gap-3 rounded-lg px-3 py-2 no-underline"
	>
		<slot />
	</router-link-tag>
</template>

<script setup>
/**
 * Renders a sidebar navigation link with an optional icon.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useMenuItem } from "@/composables/router/use-menu";

// Link and icon options supplied by the sidebar menu.
const props = defineProps({
	...RouterLink.props,

	/**
	 * The icon to use for this menu item.
	 */
	icon: {
		type: String,
		default: null,
	},
});

// Current menu state for this sidebar link.
const { state } = useMenuItem(() => props.to);

defineOptions({
	inheritAttrs: false,
});

// Determine whether this is an external link.
const isExternal = computed(() => {
	return typeof props.to === "string" && props.to.startsWith("http");
});

// Props to provide to router link, excluding the icon.
const routerLinkProps = computed(() => {
	// RouterLink options without the sidebar-only icon.
	const { icon, ...linkProps } = props;

	return linkProps;
});

// Mutually exclusive classes for the current menu state.
const menuItemClasses = computed(() => {
	if (state.value === "active") {
		return "bg-primary-subtle text-primary font-semibold";
	}

	if (state.value === "in-section") {
		return "text-content-strong";
	}

	return null;
});
</script>
