import { beforeEach, vi } from "vite-plus/test";

// Mock application-group API methods for query and component tests.
const mockDelete = vi.hoisted(() => vi.fn());
// Mock API retrieval method.
const mockGet = vi.hoisted(() => vi.fn());
// Mock authentication-token lookup method.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mock loading-state reference.
const mockIsLoading = vi.hoisted(() => ({ value: false }));
// Mock readiness-state reference.
const mockIsReady = vi.hoisted(() => ({ value: false }));
// Mock API update method.
const mockPatch = vi.hoisted(() => vi.fn());
// Mock API creation method.
const mockPost = vi.hoisted(() => vi.fn());
// Mock authentication-token storage method.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api", () => ({
	/**
	 * Returns the mocked API methods.
	 *
	 * @returns  {object}
	 *     The mocked API interface.
	 */
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
