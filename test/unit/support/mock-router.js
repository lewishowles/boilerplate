import { afterEach, beforeEach, vi } from "vite-plus/test";

// Mock router navigation method.
const mockPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
	// The router module with unmocked exports retained.
	const actual = await importOriginal();

	return {
		...actual,
		/**
		 * Returns the mocked router.
		 *
		 * @returns  {object}
		 *     The router with the mocked navigation method.
		 */
		useRouter: () => ({
			push: mockPush,
		}),
	};
});

beforeEach(() => {
	vi.clearAllMocks();
});

afterEach(() => {
	vi.restoreAllMocks();
});

export default {
	push: mockPush,
};
