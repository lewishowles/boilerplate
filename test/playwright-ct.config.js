import { alias } from "../support/aliases.js";
import { componentsResolver } from "@lewishowles/components/resolver";
import { defineConfig } from "@playwright/experimental-ct-vue";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Components from "unplugin-vue-components/vite";
import VueRouter from "vue-router/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

import {
	chromiumProject,
	loadTestEnv,
	sharedSnapshotDir,
	sharedUse,
} from "./playwright-shared.config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadTestEnv();

export default defineConfig({
	testDir: join(__dirname, "../src"),
	testMatch: "**/*.ct.js",
	snapshotDir: sharedSnapshotDir,
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
			envDir: join(__dirname, ".."),
			resolve: { alias },
			optimizeDeps: {
				exclude: ["@lewishowles/components", "@lewishowles/helpers"],
			},
		},
	},
	projects: [chromiumProject],
});
