import "@/assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { beforeMount } from "@playwright/experimental-ct-vue/hooks";
import { createPinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { routes } from "vue-router/auto-routes";

import componentLibrary from "@lewishowles/components";

beforeMount(async ({ app }) => {
	// Use the application's generated routes with an isolated in-memory history for each mount.
	const router = createRouter({ history: createMemoryHistory(), routes });

	app.use(createPinia());
	app.use(PiniaColada);
	app.use(componentLibrary);
	app.use(router);
});
