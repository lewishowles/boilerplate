<template>
	<header
		class="app-title-bar border-border bg-surface sticky top-0 z-20 border-b py-2 lg:min-h-18"
	>
		<div class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3">
			<div class="flex items-center gap-3">
				<router-link v-slot="{ href, navigate }" :to="{ name: 'home' }" custom>
					<link-tag
						class="button--muted inline-flex items-center justify-center lg:hidden"
						v-bind="{ href }"
						icon-start="icon-home"
						icon-only
						@click="navigate"
					>
						Home
					</link-tag>
				</router-link>

				<ui-button
					class="button--muted hidden lg:inline-flex"
					v-bind="{ iconStart: 'icon-sidebar', iconOnly: true, pressed: showSidebar }"
					@click="toggleSidebar"
				>
					Toggle sidebar
				</ui-button>

				<mobile-menu />
			</div>

			<app-search />

			<div class="col-start-4 flex shrink-0 items-center justify-end gap-3">
				<ui-button
					class="button--muted animate-fade-in-left delay"
					v-bind="{
						iconStart: colourModeIcon,
						iconOnly: true,
					}"
					@click="toggleColourMode"
				>
					{{ colourModeActionLabel }}
				</ui-button>

				<ui-button
					class="button--muted animate-fade-in-left delay"
					v-bind="{ iconStart: 'icon-plus' }"
				>
					New something
				</ui-button>
			</div>
		</div>
	</header>
</template>

<script setup>
/**
 * Displays page controls and application navigation actions.
 */
import { useColourMode } from "@/composables/layout/use-colour-mode";
import { useSidebar } from "@/composables/layout/use-sidebar";
import { computed } from "vue";

// Current colour mode and its toggle action.
const { colourMode, toggleColourMode } = useColourMode();
// Shared sidebar state and its toggle action.
const { showSidebar, toggleSidebar } = useSidebar();

// The icon reflecting the currently resolved colour mode.
const colourModeIcon = computed(() => (colourMode.value === "dark" ? "icon-moon" : "icon-sun"));

// The accessible label describing the mode the toggle will switch to.
const colourModeActionLabel = computed(() => {
	return colourMode.value === "dark" ? "Switch to light mode" : "Switch to dark mode";
});
</script>
