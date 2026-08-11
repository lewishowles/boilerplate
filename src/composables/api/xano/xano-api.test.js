import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import createXanoApi from "./xano-api";

const mockGet = vi.hoisted(() => vi.fn());
const mockResetAuthSession = vi.hoisted(() => vi.fn());

vi.mock("@/composables/api/session-reset", () => ({
	resetAuthSession: mockResetAuthSession,
}));

describe("createXanoApi", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockResetAuthSession.mockResolvedValue(undefined);
	});

	test("Resets the auth session for an unauthorised non-login error", async () => {
		const body = { code: "ERROR_CODE_UNAUTHORIZED" };

		mockGet.mockRejectedValue(body);

		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("widgets")).rejects.toEqual(body);
		await vi.waitFor(() => expect(mockResetAuthSession).toHaveBeenCalledTimes(1));
	});

	test("Keeps the auth session for an unauthorised login error", async () => {
		const body = { code: "ERROR_CODE_UNAUTHORIZED" };

		mockGet.mockRejectedValue(body);

		const api = createXanoApi({ client: { get: mockGet } });

		await expect(api.get("auth/login")).rejects.toEqual(body);

		expect(mockResetAuthSession).not.toHaveBeenCalled();
	});
});
