<template>
	<aside
		class="border-border animade-fade-in-right flex shrink-0 flex-col"
		:class="{
			'sticky top-0 h-screen w-68 border-e max-lg:hidden': !props.alwaysVisible,
			'w-full': props.alwaysVisible,
			hidden: !props.alwaysVisible && !showSidebar,
		}"
	>
		<div class="border-border animate-fade-in delay flex min-h-18 items-center border-b px-5">
			<slot name="logo">
				<div class="flex items-center gap-3 font-bold">
					<span
						class="bg-content-strong text-surface flex size-8 items-center justify-center rounded-lg"
					>
						B
					</span>
					<span class="text-content-strong text-base tracking-tight">Boilerplate</span>
				</div>
			</slot>
		</div>

		<nav
			class="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6"
			aria-label="Primary navigation"
		>
			<sidebar-link-group>
				<template #label>Pages</template>

				<ul class="flex flex-col gap-1">
					<li>
						<sidebar-link icon="icon-dashboard" v-bind="{ to: { name: 'home' } }">
							Home
						</sidebar-link>
					</li>
					<li>
						<sidebar-link icon="icon-plus" v-bind="{ to: { name: 'sample-pages' } }">
							Sample pages
						</sidebar-link>
					</li>
				</ul>
			</sidebar-link-group>
		</nav>

		<div v-if="haveUser" class="border-border flex flex-col gap-3 border-t p-3">
			<div class="flex items-center gap-3 py-2">
				<span
					v-if="userInitial"
					class="bg-primary-subtle text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
					aria-hidden="true"
				>
					{{ userInitial }}
				</span>
				<div class="flex flex-col">
					<span class="text-content-strong truncate font-semibold">
						{{ userName }}
					</span>
				</div>
			</div>

			<ui-button class="button--muted" v-bind="{ iconStart: 'icon-exit' }" @click="logout">
				Log out
			</ui-button>
		</div>
	</aside>
</template>

<script setup>
/**
 * Displays authenticated navigation and current-user controls.
 */
import { computed } from "vue";
import { getPathValue } from "@lewishowles/helpers/object";
import { useAuth, useCurrentUser } from "@/queries/auth";
import { useSidebar } from "@/composables/layout/use-sidebar";
import { provideMenu } from "@/composables/router/use-menu";

import { IconDashboard, IconDocument } from "@lewishowles/components";

// Sidebar display options supplied by the app shell.
const props = defineProps({
	/**
	 * Whether the sidebar should remain visible when the desktop sidebar is
	 * closed.
	 */
	alwaysVisible: {
		type: Boolean,
		default: false,
	},
});

// Current-user details shown in the sidebar.
const { haveUser, userDetails } = useCurrentUser();
// Logout action shown in the sidebar menu.
const { logout } = useAuth();
// Shared sidebar visibility state.
const { showSidebar } = useSidebar();

provideMenu();

// The user's display details.
const userName = computed(() => getPathValue(userDetails.value, "display_name"));
// First letter shown in the user avatar.
const userInitial = computed(() => userName.value?.slice(0, 1));
</script>
