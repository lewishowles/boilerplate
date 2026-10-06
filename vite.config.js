import { alias } from "./support/aliases.js";
import { componentsResolver } from "@lewishowles/components/resolver";
import { comments, lintConfig, vue as vueLint } from "@lewishowles/lint-config/layers";
import { defineConfig, lazyPlugins } from "vite-plus";

import fmt from "./.oxfmtrc.json" with { type: "json" };
import localLintConfig from "./.oxlintrc.json" with { type: "json" };
import importsConfig from "@lewishowles/lint-config/imports.json" with { type: "json" };
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import VueRouter from "vue-router/vite";

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	// The project's formatter settings, plus the shared rules for sorting and
	// grouping imports.
	fmt: { ...fmt, ...importsConfig },
	// The shared Vue and comment lint rules, plus the project's own settings
	// from .oxlintrc.json. Vite+ only reads lint settings from here, and
	// lintConfig ignores the extends list in .oxlintrc.json, so the shared
	// layers are listed in both places. Keep the two lists in step.
	lint: lintConfig([vueLint, comments], localLintConfig),
	base: "/",
	plugins: lazyPlugins(() => [
		VueRouter({
			dts: false,
			// Vitest cannot stop the route plugin's own file watcher, so test
			// runs turn it off to avoid running out of open files.
			watch: !process.env.VITEST,
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
	]),
	resolve: {
		alias,
	},
	build: {
		outDir: "build",
	},
});
