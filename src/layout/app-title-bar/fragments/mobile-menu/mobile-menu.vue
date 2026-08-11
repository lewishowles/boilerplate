<template>
	<ui-button
		class="button--muted inline-flex lg:hidden"
		icon-start="icon-hamburger"
		icon-only
		@click="openMobileMenu"
	>
		Open navigation menu
	</ui-button>

	<modal-dialog ref="mobile-menu" v-bind="{ initiallyOpen: false }" aria-label="Navigation">
		<app-sidebar class="h-screen" v-bind="{ alwaysVisible: true }" />
	</modal-dialog>
</template>

<script setup>
import { useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";

import { ModalDialog } from "@lewishowles/components";

// A reference to the mobile navigation menu dialog.
const mobileMenu = useTemplateRef("mobile-menu");
// The current route.
const route = useRoute();

// Close the mobile menu after navigation.
watch(
	() => route.fullPath,
	() => {
		closeMobileMenu();
	},
);

/**
 * Open the mobile navigation menu.
 */
function openMobileMenu() {
	mobileMenu.value?.open();
}

/**
 * Close the mobile navigation menu.
 */
function closeMobileMenu() {
	mobileMenu.value?.close();
}
</script>
