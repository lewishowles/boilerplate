import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { defineConfig } from "vite-plus";
import { alias } from "./support/aliases.js";
import fmt from "./support/oxfmt.config.js";
import lint from "./support/oxlint.config.js";

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt,
	lint,
	base: "{{ BASE_URL }}",
	plugins: [vue(), vueDevTools(), tailwindcss()],
	resolve: {
		alias,
	},
	build: {
		outDir: "build",
	},
	optimizeDeps: {
		exclude: ["@lewishowles/components", "@lewishowles/helpers"],
	},
});
