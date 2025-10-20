import componentLibrary from "@lewishowles/components";
import { config } from "@vue/test-utils";
import { vi } from "vitest";

config.global.plugins = [componentLibrary];

// Mock fetch globally. With a full implementation, an API class would exist,
// which has various methods to make calling APIs and retrieving that data
// trivial. This would then be replaced with mock functions, such as "mockGet",
// which allow mocking individual responses easily from within a test suite.
globalThis.fetch = vi.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve({ status: "ok" }),
	}),
);
