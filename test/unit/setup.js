// Set before any test module loads so composables that capture document.title
// at module load time see the expected base value.
document.title = "App";

import componentLibrary from "@lewishowles/components";
import { beforeEach } from "vite-plus/test";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

config.global.plugins = [componentLibrary];

beforeEach(() => {
	setActivePinia(createPinia());
});
