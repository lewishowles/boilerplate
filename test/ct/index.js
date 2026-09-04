import "@/assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { beforeMount } from "@playwright/experimental-ct-vue/hooks";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

import componentLibrary from "@lewishowles/components";

// Empty page used for routes supplied by each component test.
const TestRoute = { template: "<div />" };

beforeMount(async ({ app, hooksConfig }) => {
	// Routes supplied by the current component test.
	const configuredRoutes = hooksConfig?.routes ?? [];
	// Test routes use one empty component because only their navigation data
	// matters.
	const testRoutes = configuredRoutes.map((route) => ({ ...route, component: TestRoute }));
	// The fallback lets components render ordinary path links without application
	// page files.
	const routes = [...testRoutes, { path: "/:pathMatch(.*)*", component: TestRoute }];

	// Router configured with the current component test's routes.
	const router = createRouter({ history: createMemoryHistory(), routes });

	app.use(createPinia());
	app.use(PiniaColada);
	app.use(componentLibrary);
	app.use(router);
});
