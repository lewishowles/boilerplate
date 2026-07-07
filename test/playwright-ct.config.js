import { alias } from "../support/aliases.js";
import {
	chromiumProject,
	loadTestEnv,
	sharedUse,
	snapshotDir,
} from "@lewishowles/testing/playwright";
import { componentsResolver } from "@lewishowles/components/resolver";
import { defineConfig } from "@playwright/experimental-ct-vue";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Components from "unplugin-vue-components/vite";
import VueRouter from "vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

const configDir = dirname(fileURLToPath(import.meta.url));

loadTestEnv(configDir);

export default defineConfig({
	testDir: join(configDir, "../src"),
	testMatch: "**/*.ct.js",
	snapshotDir: snapshotDir(configDir),
	use: {
		...sharedUse,
		ctPort: 3100,
		ctTemplateDir: "ct",
		ctViteConfig: {
			plugins: [
				VueRouter({ dts: false }),
				Components({
					dts: false,
					dirs: ["src/components", "src/layout"],
					resolvers: [componentsResolver()],
				}),
				tailwindcss(),
				vue(),
			],
			envDir: join(configDir, ".."),
			resolve: { alias },
			optimizeDeps: {
				exclude: ["@lewishowles/components", "@lewishowles/helpers"],
			},
		},
	},
	projects: [chromiumProject],
});
