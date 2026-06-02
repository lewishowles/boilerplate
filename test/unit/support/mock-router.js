import { afterEach, beforeEach, vi } from "vite-plus/test";

const mockPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
	const actual = await importOriginal();

	return {
		...actual,
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
