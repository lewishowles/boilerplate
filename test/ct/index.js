import "@/assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { beforeMount } from "@playwright/experimental-ct-vue/hooks";
import { createPinia } from "pinia";

import componentLibrary from "@lewishowles/components";

beforeMount(async ({ app }) => {
	app.use(createPinia());
	app.use(PiniaColada);
	app.use(componentLibrary);
});
