import componentLibrary from "@lewishowles/components";
import { config } from "@vue/test-utils";
import { vi } from "vitest";

config.global.plugins = [componentLibrary];

// Mock fetch for tests—future: replace with dedicated API service with mockGet/mockPost helpers
globalThis.fetch = vi.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({ status: "ok" }),
	}),
);
