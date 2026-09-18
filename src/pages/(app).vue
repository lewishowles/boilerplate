<template>
	<a href="#main" class="sr-only focus-visible:not-sr-only">Skip to main content</a>

	<div class="text-content bg-surface-subtle grid min-h-screen grid-cols-[auto_minmax(0,1fr)]">
		<app-sidebar />

		<div
			class="app-shell min-w-0 max-lg:col-span-full"
			:class="{ 'col-span-full': !showSidebar, 'col-start-2': showSidebar }"
		>
			<app-title-bar />

			<main id="main" ref="mainElement" tabindex="-1" class="app-main bg-surface-subtle">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup>
/**
 * Renders the authenticated application shell.
 */
import { nextTick, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { definePage } from "vue-router/experimental";
import { useSidebar } from "@/composables/layout/use-sidebar";

// The main landmark, which takes focus when the user moves to another page.
const mainElement = ref();
// The app router, used to listen to navigations.
const router = useRouter();
// The app shell expands into the sidebar column when navigation is closed.
const { showSidebar } = useSidebar();
// AFter router navigation, focus the main element.
const removeNavigationFocusHandler = router.afterEach(focusMainAfterNavigation);

// Stop listening once the user leaves the app.
onBeforeUnmount(removeNavigationFocusHandler);

/**
 * Move focus to the main landmark after navigating to a different page, so
 * keyboard and screen-reader users start at the new content. Links with a hash
 * keep the browser's own target, and query-only changes stay put. Focus waits
 * for the new page to render and never scrolls, so saved back and forward
 * positions still apply.
 *
 * @param  {object}  to
 *     The destination route.
 * @param  {object}  from
 *     The route being left.
 * @param  {object|null}  failure
 *     The navigation failure, when the router did not complete the move.
 */
async function focusMainAfterNavigation(to, from, failure) {
	if (failure || to.hash || to.path === from.path) {
		return;
	}

	await nextTick();

	mainElement.value?.focus({ preventScroll: true });
}

definePage({
	meta: { requiresAuth: true },
});
</script>
