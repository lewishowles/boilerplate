import { beforeEach, vi } from "vite-plus/test";

// Mock API methods for query and component tests.
const mockDelete = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());
const mockHasAuthToken = vi.hoisted(() => vi.fn());
const mockIsLoading = vi.hoisted(() => ({ value: false }));
const mockIsReady = vi.hoisted(() => ({ value: false }));
const mockPatch = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/use-api", () => ({
	default: () => ({
		delete: mockDelete,
		get: mockGet,
		hasAuthToken: mockHasAuthToken,
		isLoading: mockIsLoading,
		isReady: mockIsReady,
		patch: mockPatch,
		post: mockPost,
		setAuthToken: mockSetAuthToken,
	}),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

export default {
	delete: mockDelete,
	get: mockGet,
	hasAuthToken: mockHasAuthToken,
	isLoading: mockIsLoading,
	isReady: mockIsReady,
	patch: mockPatch,
	post: mockPost,
	setAuthToken: mockSetAuthToken,
};
