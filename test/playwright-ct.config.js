import {
	chromiumProject,
	loadTestEnv,
	sharedUse,
	snapshotDir,
} from "@lewishowles/testing/playwright";

import { defineConfig } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Directory containing this component-test configuration.
const configDir = dirname(fileURLToPath(import.meta.url));
// Gallery page served by the app's Vite development server.
const galleryUrl = "http://localhost:5173/test/component/gallery/index.html";

loadTestEnv(configDir);

export default defineConfig({
	testDir: join(configDir, "../src"),
	testMatch: "**/*.pw.js",
	snapshotDir: snapshotDir(configDir),
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	fullyParallel: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 1,
	use: {
		...sharedUse,
		baseURL: galleryUrl,
		reuseContext: true,
		serviceWorkers: "block",
		trace: process.env.CI ? "on-first-retry" : "off",
	},
	projects: [chromiumProject],
	webServer: {
		command: "bun run dev",
		reuseExistingServer: !process.env.CI,
		url: galleryUrl,
	},
});
