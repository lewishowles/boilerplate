// Set before any test module loads so composables that capture document.title
// at module load time see the expected base value.
document.title = "App";

import componentLibrary from "@lewishowles/components";
import { afterEach, beforeEach, vi } from "vite-plus/test";
import { cleanupMountedWrappers } from "./support/mount";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

config.global.plugins = [componentLibrary];

beforeEach(() => {
	setActivePinia(createPinia());
});

// Provide a consistent localStorage mock.
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	key: vi.fn(),
	length: 0,
};

vi.stubGlobal("localStorage", localStorageMock);

// Clean up all mounted component instances after each test to prevent global
// listener pollution from @vueuse/core handlers (e.g., onKeyStroke).
afterEach(() => {
	cleanupMountedWrappers();
});
