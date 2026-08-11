<template>
	<header class="app-title-bar border-border bg-surface sticky top-0 z-20 min-h-18 border-b">
		<div class="flex items-center justify-between gap-3">
			<div class="flex items-center gap-3">
				<router-link v-slot="{ href, navigate }" :to="{ name: 'page-one' }" custom>
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

			<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
				<form-field v-bind="{ displayLabel: false }" class="animate-fade-in-left delay">
					Search

					<template #prefix>
						<icon-search />
					</template>
				</form-field>

				<ui-button
					class="button--muted animate-fade-in-left delay"
					v-bind="{ iconStart: 'icon-bell', iconOnly: true }"
				>
					Notifications
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
import { useSidebar } from "@/composables/layout/use-sidebar";

const { showSidebar, toggleSidebar } = useSidebar();
</script>
