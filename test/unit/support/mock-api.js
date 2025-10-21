import { afterEach, beforeEach, vi } from "vitest";

import { ref } from "vue";

const mockGet = vi.fn();

vi.mock("@/composables/use-api/use-api", () => ({
	default: () => ({
		get: mockGet,
		isLoading: ref(false),
		isReady: ref(false),
	}),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

export default {
	get: mockGet,
};
