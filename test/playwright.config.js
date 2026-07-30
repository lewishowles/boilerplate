import {
	chromiumProject,
	loadTestEnv,
	sharedUse,
	snapshotDir,
} from "@lewishowles/testing/playwright";
import { defineConfig } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const configDir = dirname(fileURLToPath(import.meta.url));

loadTestEnv(configDir);

export default defineConfig({
	testDir: "./e2e/journeys",
	testMatch: "**/*.e2e.js",
	snapshotDir: snapshotDir(configDir),
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	fullyParallel: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 1,
	use: {
		...sharedUse,
		baseURL: process.env.VITE_APP_URL ?? "http://localhost:5173",
		trace: process.env.CI ? "on-first-retry" : "off",
	},
	projects: [chromiumProject],
	webServer: {
		command: "bun run dev",
		url: process.env.VITE_APP_URL ?? "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
});
