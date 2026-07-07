// Set before any test module loads so composables that capture document.title
// at module load time see the expected base value.
document.title = "App";

import componentLibrary from "@lewishowles/components";
import { mockLocalStorage, setupConsole } from "@lewishowles/testing/vitest";
import { setupVueMounting } from "@lewishowles/testing/vue";
import { beforeEach } from "vite-plus/test";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

config.global.plugins = [componentLibrary];

beforeEach(() => {
	setActivePinia(createPinia());
});

mockLocalStorage();
setupConsole();
setupVueMounting();
