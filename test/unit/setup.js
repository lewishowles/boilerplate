import componentLibrary from "@lewishowles/components";
import { beforeEach } from "vite-plus/test";
import { config } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

config.global.plugins = [componentLibrary];

beforeEach(() => {
	setActivePinia(createPinia());
});
