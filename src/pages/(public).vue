<template>
	<a href="#main" class="sr-only focus-visible:not-sr-only">Skip to main content</a>

	<div class="bg-surface-subtle min-h-screen px-4 pb-12 lg:px-12">
		<header class="border-border border-b">
			<div class="mx-auto max-w-2xl py-4">
				<div class="flex items-center gap-3 font-bold">
					<span
						class="bg-content-strong text-surface flex size-8 items-center justify-center rounded-lg"
					>
						B
					</span>
					<span class="text-content-strong text-base tracking-tight">Boilerplate</span>
				</div>
			</div>
		</header>

		<main
			id="main"
			class="mx-auto grid max-w-2xl content-start py-5 lg:py-8"
			style="
				grid-template-columns:
					[full-start content-start]
					minmax(0, 1fr) [content-end full-end];
			"
		>
			<RouterView />
		</main>
	</div>
</template>

<script setup>
/**
 * Render public pages that appear outside of the normal app flow.
 */
import { RouterView } from "vue-router";
import { definePage } from "vue-router/experimental";

// Public pages carry the operator's name in their titles instead of AirOps
// Admin.
definePage({
	meta: { base_title: "{{SITE_TITLE}}" },
});
</script>
