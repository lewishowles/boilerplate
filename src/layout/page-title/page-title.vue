<template>
	<div class="boxed-section pb-6 lg:pb-8">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
			<div class="flex flex-col">
				<div
					v-if="$slots.breadcrumbs || breadcrumbItems.length > 1"
					class="animate-fade-in-up delay text-content-muted mbe-1 text-xs"
				>
					<slot name="breadcrumbs" :items="breadcrumbItems">
						<breadcrumb-list>
							<breadcrumb-item
								v-for="breadcrumb in breadcrumbItems"
								:key="breadcrumb.id"
								v-bind="breadcrumb"
							>
								{{ breadcrumb.label }}
							</breadcrumb-item>
						</breadcrumb-list>
					</slot>
				</div>

				<h1
					class="animate-fade-in-up delay text-content-strong text-3xl leading-tight font-bold tracking-tight wrap-break-word lg:text-4xl"
				>
					<slot>
						<div class="py-1">
							<loading-spinner class="text-content-strong size-6" />
						</div>
						<span class="sr-only">Loading page</span>
					</slot>
				</h1>

				<p
					v-if="$slots.introduction"
					class="animate-fade-in-up delay text-content-muted max-w-2xl text-base"
				>
					<slot name="introduction" />
				</p>
			</div>
			<div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center gap-2 lg:ms-auto">
				<slot name="actions" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useBreadcrumbs } from "@/composables/router/use-breadcrumbs";

// The router resolves each breadcrumb destination to a link URL.
const router = useRouter();
// The current route's breadcrumb trail.
const breadcrumbs = useBreadcrumbs();

// Breadcrumbs prepared for the Components navigation elements.
const breadcrumbItems = computed(() =>
	breadcrumbs.value.map((breadcrumb) => ({
		current: breadcrumb.current,
		href: router.resolve(breadcrumb.to).href,
		id: breadcrumb.id,
		label: breadcrumb.label,
	})),
);
</script>
