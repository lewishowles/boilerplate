import { alias } from "./support/aliases.js";
import { componentsResolver } from "@lewishowles/components/resolver";
import { defineConfig, lazyPlugins } from "vite-plus";

import fmt from "./.oxfmtrc.json" with { type: "json" };
import lintConfig from "./.oxlintrc.json" with { type: "json" };
import baseLintConfig from "@lewishowles/lint-config/base.json" with { type: "json" };
import commentsLintConfig from "@lewishowles/lint-config/comments.json" with { type: "json" };
import importsConfig from "@lewishowles/lint-config/imports.json" with { type: "json" };
import vueLintConfig from "@lewishowles/lint-config/vue.json" with { type: "json" };
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import vueDevTools from "vite-plugin-vue-devtools";
import VueRouter from "vue-router/vite";

// Vite-plus's own config loader requires every `extends` entry, at every
// nesting level, to be a config object rather than the file-path strings oxlint
// itself accepts, so resolve the shared layers here rather than relying on
// .oxlintrc.json's or vue.json's own string-based extends.
const lint = {
	...lintConfig,
	extends: [{ ...vueLintConfig, extends: [baseLintConfig] }, commentsLintConfig],
};

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	// The project's formatter settings, plus the shared rules for sorting and
	// grouping imports.
	fmt: { ...fmt, ...importsConfig },
	lint,
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
