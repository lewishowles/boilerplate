import { devices } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Load local Vite environment variables for Playwright workers.
 */
export function loadTestEnv() {
	try {
		process.loadEnvFile(join(__dirname, "../.env"));
	} catch {
		// No .env in CI — env vars come from the environment directly.
	}
}

export const chromiumProject = {
	name: "chromium",
	use: { ...devices["Desktop Chrome"] },
};

export const sharedSnapshotDir = join(__dirname, "snapshots");

export const sharedUse = {
	testIdAttribute: "data-test",
};
