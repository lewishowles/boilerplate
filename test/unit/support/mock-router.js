import { afterEach, beforeEach, vi } from "vitest";

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
