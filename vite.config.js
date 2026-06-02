import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { defineConfig } from "vite-plus";
import { fileURLToPath, URL } from "node:url";
import fmt from "./oxfmt.config.js";
import lint from "./oxlint.config.js";

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt,
	lint,
	base: "{{ BASE_URL }}",
	plugins: [
		vue(),
		vueDevTools(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@unit": fileURLToPath(new URL("./test/unit", import.meta.url)),
			"@test": fileURLToPath(new URL("./test", import.meta.url)),
		},
	},
	build: {
		outDir: "build",
	},
	optimizeDeps: {
		exclude: ["@lewishowles/components", "@lewishowles/helpers"],
	},
});
