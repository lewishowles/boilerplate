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
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	fullyParallel: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 1,
	use: {
		...sharedUse,
		ctPort: 3100,
		ctTemplateDir: "ct",
		trace: process.env.CI ? "on-first-retry" : "off",
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
