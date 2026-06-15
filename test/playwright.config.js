import { defineConfig } from "@playwright/test";

import {
	chromiumProject,
	loadTestEnv,
	sharedSnapshotDir,
	sharedUse,
} from "./playwright-shared.config.js";

loadTestEnv();

export default defineConfig({
	testDir: "./e2e/journeys",
	testMatch: "**/*.e2e.js",
	snapshotDir: sharedSnapshotDir,
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
