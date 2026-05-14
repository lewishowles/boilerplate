import useApi from "./use-api";
import { describe, expect, test } from "vitest";
import { flushPromises } from "@vue/test-utils";

describe("use-api", () => {
	const url = "test";

	describe("initialization", () => {
		test("initialises isLoading and isReady to false", () => {
			const { isLoading, isReady } = useApi();

			expect(isLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
		});
	});

	describe("get", () => {
		test.for([
			["number (positive)", 1],
			["number (negative)", -1],
			["number (NaN)", NaN],
			["string (empty)", ""],
			["object (non-empty)", { property: "value" }],
			["object (empty)", {}],
			["array (non-empty)", [1, 2, 3]],
			["array (empty)", []],
			["null", null],
			["undefined", undefined],
		])("rejects invalid endpoints: %s", async ([, endpoint]) => {
			const { get } = useApi();

			await expect(get(endpoint)).rejects.toThrow();
		});

		test("calls fetch with correct URL", async () => {
			const { get } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => {} });

			await get(url);

			await flushPromises();

			expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test");
		});

		test("returns response body", async () => {
			const { get } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => ({ my: "data" }) });

			const response = await get(url);

			await flushPromises();

			expect(response).toEqual({ my: "data" });
		});

		test("rejects on API error", async () => {
			const { get } = useApi();

			fetch.mockRejectedValueOnce({ ok: false, json: () => ({ message: "Error message" }) });

			await expect(get(url)).rejects.toThrow();
		});

		test("sets isLoading during fetch", async () => {
			const { isLoading, get } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => {} });

			const getPromise = get(url);

			expect(isLoading.value).toBe(true);

			await getPromise;
		});

		test("sets isReady after success", async () => {
			const { isReady, get } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => {} });

			await get(url);

			expect(isReady.value).toBe(true);
		});

		test("clears isLoading after fetch", async () => {
			const { isLoading, get } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => {} });

			await get(url);

			expect(isLoading.value).toBe(false);
		});
	});

	describe("setBaseUrl", () => {
		test.for([
			["boolean (true)", true],
			["boolean (false)", false],
			["number (positive)", 1],
			["number (negative)", -1],
			["number (NaN)", NaN],
			["string (empty)", ""],
			["object (non-empty)", { property: "value" }],
			["object (empty)", {}],
			["array (non-empty)", [1, 2, 3]],
			["array (empty)", []],
			["null", null],
			["undefined", undefined],
		])("rejects invalid URLs: %s", async ([, invalidUrl]) => {
			const { setBaseUrl } = useApi();

			expect(() => setBaseUrl(invalidUrl)).toThrow();
		});

		test("updates base URL", async () => {
			const { get, setBaseUrl } = useApi();

			fetch.mockResolvedValueOnce({ ok: true, json: () => {} });

			setBaseUrl("testing");

			await get(url);

			await flushPromises();

			expect(fetch).toHaveBeenCalledWith("testing/test");
		});
	});

	describe("getBaseUrl", () => {
		test("returns default URL", () => {
			const { getBaseUrl } = useApi();

			expect(getBaseUrl()).toBe("http://localhost:3000/api");
		});

		test("reflects updated URL", () => {
			const { getBaseUrl, setBaseUrl } = useApi();

			setBaseUrl("testing");

			expect(getBaseUrl()).toBe("testing");
		});
	});
});
