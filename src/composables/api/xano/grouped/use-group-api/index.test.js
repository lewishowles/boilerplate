import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import useGroupApi from ".";

const mockDelete = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());
const mockHasAuthToken = vi.hoisted(() => vi.fn());
const mockPatch = vi.hoisted(() => vi.fn());
const mockPost = vi.hoisted(() => vi.fn());
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
		mockGet.mockResolvedValue({ getBody: () => ({}) });
	});

	test.for([
		["no leading slash", "widgets", "/api:group/widgets"],
		["leading slash", "/widgets", "/api:group/widgets"],
		["nested paths", "widgets/123", "/api:group/widgets/123"],
	])("Combines the group ID with %s", async ([, endpoint, expected]) => {
		const { get } = useGroupApi("api:group");

		await get(endpoint);

		expect(mockGet).toHaveBeenCalledWith(expected);
	});

	test("Passes query parameters through to the grouped request", async () => {
		const { get } = useGroupApi("api:group");

		await get("widgets", { page: 2 });

		expect(mockGet).toHaveBeenCalledWith("/api:group/widgets", { page: 2 });
	});

	test.for([undefined, null, ""])("Rejects an invalid fixed group ID: %s", (groupId) => {
		expect(() => useGroupApi(groupId)).toThrow();
	});

	test("Does not expose mutable group configuration", () => {
		const api = useGroupApi("api:group");

		expect(api).not.toHaveProperty("setGroupId");
	});

	test("Keeps request state independent for separate groups", () => {
		const applicationApi = useGroupApi("api:application");
		const authenticationApi = useGroupApi("api:authentication");

		expect(applicationApi.isLoading).not.toBe(authenticationApi.isLoading);
		expect(applicationApi.isReady).not.toBe(authenticationApi.isReady);
	});

	test("Does not report one group's request as another group's loading state", async () => {
		let resolveApplicationRequest;

		const applicationRequest = new Promise((resolve) => {
			resolveApplicationRequest = resolve;
		});

		const applicationApi = useGroupApi("api:application");
		const authenticationApi = useGroupApi("api:authentication");

		mockGet.mockImplementationOnce(() => applicationRequest);
		mockGet.mockResolvedValueOnce({ getBody: () => ({}) });

		const pendingApplicationRequest = applicationApi.get("widgets");

		await Promise.resolve();

		expect(applicationApi.isLoading.value).toBe(true);
		expect(authenticationApi.isLoading.value).toBe(false);

		await authenticationApi.get("auth/me");

		expect(authenticationApi.isReady.value).toBe(true);
		expect(applicationApi.isReady.value).toBe(false);

		resolveApplicationRequest({ getBody: () => ({}) });
		await pendingApplicationRequest;
	});

	test("Shares token storage through the Xano client", () => {
		const { hasAuthToken, setAuthToken } = useGroupApi("api:group");

		setAuthToken("token-123");

		expect(setAuthToken).toBeTypeOf("function");
		expect(hasAuthToken).toBeTypeOf("function");
		expect(mockSetAuthToken).toHaveBeenCalledWith("token-123");
	});
});
