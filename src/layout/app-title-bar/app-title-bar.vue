<template>
	<header class="app-title-bar">
		<ui-button
			class="hidden lg:block"
			v-bind="{ iconStart: 'icon-sidebar', iconOnly: true, pressed: showSidebar }"
			@click="toggleSidebar"
		>
			Toggle sidebar
		</ui-button>

		<mobile-menu />
	</header>
</template>

<script setup>
import { useSidebar } from "@/composables/layout/use-sidebar";

const { showSidebar, toggleSidebar } = useSidebar();
</script>
