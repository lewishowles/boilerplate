import { alias } from "./support/aliases.js";
import { componentsResolver } from "@lewishowles/components/resolver";
import { defineConfig } from "vite-plus";
import Components from "unplugin-vue-components/vite";
import VueRouter from "vue-router/vite";
import baseLintConfig from "@lewishowles/lint-config/base.json" with { type: "json" };
import fmt from "./.oxfmtrc.json" with { type: "json" };
import lintConfig from "./.oxlintrc.json" with { type: "json" };
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vueLintConfig from "@lewishowles/lint-config/vue.json" with { type: "json" };

// vite-plus's own config loader requires every `extends` entry, at every
// nesting level, to be a config object rather than the file-path strings
// oxlint itself accepts, so resolve the shared layers here rather than
// relying on .oxlintrc.json's or vue.json's own string-based extends.
const lint = {
	...lintConfig,
	extends: [{ ...vueLintConfig, extends: [baseLintConfig] }],
};

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt,
	lint,
	base: "/",
	plugins: [
		VueRouter({
			dts: false,
		}),
		Components({
			dts: false,
			// Automatically resolve components and layout components.
			dirs: ["src/components", "src/layout"],
			// Automatically resolve components in the component library.
			resolvers: [componentsResolver()],
		}),
		tailwindcss(),
		vue(),
		vueDevTools(),
	],
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
