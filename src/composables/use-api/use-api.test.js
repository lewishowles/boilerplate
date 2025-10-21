import useApi from "./use-api";
import { describe, expect, test } from "vitest";
import { flushPromises } from "@vue/test-utils";

describe("use-api", () => {
	const url = "test";

	describe("Throws an error if the provided url is not a non-empty string", () => {
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
		])("%s", async ([, url]) => {
			const { get } = useApi();

			await expect(get(url)).rejects.toThrow();
		});
	});

	describe("get", () => {
		describe("Expects a valid endpoint", () => {
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
			])("%s", async([, endpoint]) => {
				const { get } = useApi();

				await expect(get(endpoint)).rejects.toThrow();
			});
		});

		test("Makes the appropriate API call", async() => {
			const { get } = useApi();

			fetch.mockResolvedValueOnce({ json: () => {} });

			await get(url);

			await flushPromises();

			expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test");
		});

		test("Unwraps the response", async() => {
			const { get } = useApi();

			fetch.mockResolvedValueOnce({ json: () => ({ data: { my: "data" } }) });

			const response = await get(url);

			await flushPromises();

			expect(response).toEqual({ my: "data" });
		});

		test("Initialises with isLoading and isReady set to false", () => {
			const { isLoading, isReady } = useApi();

			expect(isLoading.value).toBe(false);
			expect(isReady.value).toBe(false);
		});

		test("Sets isLoading to true when load is called", async () => {
			const { isLoading, get } = useApi();

			const getPromise = get(url);

			expect(isLoading.value).toBe(true);

			await getPromise;
		});

		test("Sets isReady to true after loading data", async () => {
			const { isReady, get } = useApi();

			await get(url);

			expect(isReady.value).toBe(true);
		});

		test("Sets isLoading to false after load completes", async () => {
			const { isLoading, get } = useApi();

			await get(url);

			expect(isLoading.value).toBe(false);
		});
	});

	describe("setBaseUrl", () => {
		describe("Expects a valid base URL", () => {
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
			])("%s", async([, url]) => {
				const { setBaseUrl } = useApi();

				expect(() => setBaseUrl(url)).toThrow();
			});
		});

		test("The base URL can be updated", async() => {
			const { get, setBaseUrl } = useApi();

			fetch.mockResolvedValueOnce({ json: () => {} });

			setBaseUrl("testing");

			await get(url);

			await flushPromises();

			expect(fetch).toHaveBeenCalledWith("testing/test");
		});
	});

	describe("getBaseUrl", () => {
		test("Reflects the default base URL", () => {
			const { getBaseUrl } = useApi();

			expect(getBaseUrl()).toBe("http://localhost:3000/api");
		});

		test("Reflects an updated base URL", () => {
			const { getBaseUrl, setBaseUrl } = useApi();

			setBaseUrl("testing");

			expect(getBaseUrl()).toBe("testing");
		});
	});
});
