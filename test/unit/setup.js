// Set before any test module loads so composables that capture document.title
// at module load time see the expected base value.
document.title = "App";

import { mockLocalStorage, setupConsole } from "@lewishowles/testing/vitest";
import { setupVueTests } from "@lewishowles/testing/vue";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach } from "vite-plus/test";

import componentLibrary from "@lewishowles/components";

config.global.plugins = [componentLibrary];

beforeEach(() => {
	setActivePinia(createPinia());
	mockLocalStorage();
});

setupConsole();
setupVueTests();
