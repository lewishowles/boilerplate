import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import useGroupApi from ".";

// Mock used to observe grouped DELETE requests.
const mockDelete = vi.hoisted(() => vi.fn());
// Mock used to observe grouped GET requests.
const mockGet = vi.hoisted(() => vi.fn());
// Mock used to observe grouped auth-token reads.
const mockHasAuthToken = vi.hoisted(() => vi.fn());
// Mock used to observe grouped PATCH requests.
const mockPatch = vi.hoisted(() => vi.fn());
// Mock used to observe grouped POST requests.
const mockPost = vi.hoisted(() => vi.fn());
// Mock used to observe grouped auth-token writes.
const mockSetAuthToken = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/xano/grouped/xano-client", () => ({
	xano: {
		delete: mockDelete,
		get: mockGet,
		hasAuthToken: mockHasAuthToken,
		patch: mockPatch,
		post: mockPost,
		setAuthToken: mockSetAuthToken,
	},
}));

describe("use-group-api", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGet.mockResolvedValue({
			/**
			 * Provide the Xano response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano response body.
			 */
			getBody: () => ({}),
		});
	});

	test.for([
		["no leading slash", "widgets", "/api:group/widgets"],
		["leading slash", "/widgets", "/api:group/widgets"],
		["nested paths", "widgets/123", "/api:group/widgets/123"],
	])("Combines the group ID with %s", async ([, endpoint, expected]) => {
		// Grouped GET method under test.
		const { get } = useGroupApi("api:group");

		await get(endpoint);

		expect(mockGet).toHaveBeenCalledWith(expected);
	});

	test("Passes query parameters through to the grouped request", async () => {
		// Grouped GET method under test.
		const { get } = useGroupApi("api:group");

		await get("widgets", { page: 2 });

		expect(mockGet).toHaveBeenCalledWith("/api:group/widgets", { page: 2 });
	});

	test.for([undefined, null, ""])("Rejects an invalid fixed group ID: %s", (groupId) => {
		expect(() => useGroupApi(groupId)).toThrow();
	});

	test("Does not expose mutable group configuration", () => {
		// Group API adapter under test.
		const api = useGroupApi("api:group");

		expect(api).not.toHaveProperty("setGroupId");
	});

	test("Keeps request state independent for separate groups", () => {
		// Application-group API adapter under test.
		const applicationApi = useGroupApi("api:application");
		// Authentication-group API adapter under test.
		const authenticationApi = useGroupApi("api:authentication");

		expect(applicationApi.isLoading).not.toBe(authenticationApi.isLoading);
		expect(applicationApi.isReady).not.toBe(authenticationApi.isReady);
	});

	test("Does not report one group's request as another group's loading state", async () => {
		// Resolver used to finish the pending application request.
		let resolveApplicationRequest;

		// Delayed request used to observe independent loading state.
		const applicationRequest = new Promise((resolve) => {
			resolveApplicationRequest = resolve;
		});

		// Application-group API adapter under test.
		const applicationApi = useGroupApi("api:application");
		// Authentication-group API adapter under test.
		const authenticationApi = useGroupApi("api:authentication");

		mockGet.mockImplementationOnce(() => applicationRequest);
		mockGet.mockResolvedValueOnce({
			/**
			 * Provide the Xano response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano response body.
			 */
			getBody: () => ({}),
		});

		// Pending application request used to observe loading state.
		const pendingApplicationRequest = applicationApi.get("widgets");

		await Promise.resolve();

		expect(applicationApi.isLoading.value).toBe(true);
		expect(authenticationApi.isLoading.value).toBe(false);

		await authenticationApi.get("auth/me");

		expect(authenticationApi.isReady.value).toBe(true);
		expect(applicationApi.isReady.value).toBe(false);

		resolveApplicationRequest({
			/**
			 * Provide the Xano response stub.
			 *
			 * @returns  {object}
			 *     The stubbed Xano response body.
			 */
			getBody: () => ({}),
		});
		await pendingApplicationRequest;
	});

	test("Shares token storage through the Xano client", () => {
		// Grouped auth-token methods under test.
		const { hasAuthToken, setAuthToken } = useGroupApi("api:group");

		setAuthToken("token-123");

		expect(setAuthToken).toBeTypeOf("function");
		expect(hasAuthToken).toBeTypeOf("function");
		expect(mockSetAuthToken).toHaveBeenCalledWith("token-123");
	});
});
