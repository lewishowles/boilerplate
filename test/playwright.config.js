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
	use: {
		...sharedUse,
		baseURL: process.env.VITE_APP_URL ?? "http://localhost:5173",
	},
	projects: [chromiumProject],
	webServer: {
		command: "bun run dev",
		url: process.env.VITE_APP_URL ?? "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
	},
});
