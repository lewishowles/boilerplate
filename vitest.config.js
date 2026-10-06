import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite-plus";

import viteConfig from "./vite.config.js";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			setupFiles: "./test/unit/setup.js",
			environment: "happy-dom",
			// Sets up the test page once per worker rather than once per test
			// file, which was over half of the unit test run time. Test files
			// can then see page changes left by earlier files, so tests should
			// undo anything they change on the page.
			pool: "vmThreads",
			root: fileURLToPath(new URL("./", import.meta.url)),
			include: ["src/**/*.test.js"],
		},
	}),
);
