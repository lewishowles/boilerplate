<template>
	<aside class="flex flex-col gap-6" :class="{ 'sr-only': !showSidebar }">
		<div class="flex items-center justify-between gap-2">
			<slot name="logo" />

			<ui-button
				v-bind="{ iconStart: 'icon-sidebar', iconOnly: true, pressed: showSidebar }"
				@click="toggleSidebar"
			>
				Toggle sidebar
			</ui-button>
		</div>

		<nav class="flex flex-col gap-6" aria-label="Primary navigation">
			<sidebar-section>
				<template #label>Menu</template>

				<ul class="flex flex-col">
					<li>
						<sidebar-link v-bind="{ icon: IconHome, to: { name: 'home' } }">Home</sidebar-link>
					</li>
				</ul>
			</sidebar-section>
		</nav>

		<div v-if="haveUser" class="mt-auto flex flex-col gap-2">
			<div class="flex flex-col">
				<span>{{ userName }}</span>
			</div>

			<ui-button v-bind="{ iconStart: 'icon-exit' }" @click="logout">Log out</ui-button>
		</div>
	</aside>
</template>

<script setup>
import { computed } from "vue";
import { getPathValue } from "@lewishowles/helpers/object";
import { useAuth, useCurrentUser } from "@/queries/auth";
import { useSidebar } from "@/composables/layout/use-sidebar";

import { IconHome } from "@lewishowles/components";

const { haveUser, userDetails } = useCurrentUser();
const { logout } = useAuth();
const { showSidebar, toggleSidebar } = useSidebar();

// The user's display name.
const userName = computed(() => getPathValue(userDetails.value, "display_name"));
</script>
