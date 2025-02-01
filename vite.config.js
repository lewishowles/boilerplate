import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
	base: "[[BASE_URL]]",
	plugins: [
		vue(),
		vueDevTools(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"@cypress": fileURLToPath(new URL("./test/cypress", import.meta.url)),
			"@unit": fileURLToPath(new URL("./test/unit", import.meta.url)),
		},
	},
});
