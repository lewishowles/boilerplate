import { useDetailQuery } from "./use-detail-query";
import { withAppContext } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";
import { ref } from "vue";

/**
 * Create a detail query with a test API in a Vue app context.
 *
 * @param  {object}  [options]
 *     Settings for the test record.
 * @param  {string|Ref<string>}  [options.id]
 *     The record ID.
 * @param  {object}  [options.response]
 *     The response returned by the test API.
 * @param  {Error}  [options.error]
 *     The error the test API rejects with, in place of the response.
 *
 * @returns  {object}
 *     The query state and its API and formatter spies.
 */
function createDetail({ id = null, response, error } = {}) {
	// The API request, which fails with the error or returns the response.
	const get = error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(response);
	// The test formatter, which marks the record so formatting is visible.
	const format = vi.fn((record) => ({ ...record, derived: {} }));

	// The domain definition passed to the detail query.
	const domain = {
		api: { get },
		endpoint: "records",
		format,
		keys: { byId: (recordId) => ["records", recordId] },
	};

	// The detail query state created inside the app context.
	const detail = withAppContext(() => useDetailQuery({ domain, id }));

	return { ...detail, format, get };
}

describe("useDetailQuery", () => {
	test("Does not request a record without an ID", async () => {
		// The disabled query and API spy.
		const {
			get,
			haveRecord,
			isInitialLoading,
			isReady,
			isRefreshing,
			lastFetched,
			record,
			refetch,
		} = createDetail();

		await vi.waitFor(() => expect(isInitialLoading.value).toBe(false), { timeout: 500 });

		expect(get).not.toHaveBeenCalled();
		expect(record.value).toBe(null);
		expect(haveRecord.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(isRefreshing.value).toBe(false);
		expect(lastFetched.value).toBe(null);
		expect(refetch).toBeTypeOf("function");
	});

	test("Loads and formats a record by ID", async () => {
		// The API response for the requested record.
		const response = { id: "record-1" };

		// The query and test spies for this record.
		const { format, get, haveRecord, isReady, lastFetched, record, refetch } = createDetail({
			id: "record-1",
			response,
		});

		await refetch(true);

		expect(get).toHaveBeenCalledWith("records/record-1");
		expect(format).toHaveBeenCalledWith(response);
		expect(record.value).toEqual({ ...response, derived: {} });
		expect(haveRecord.value).toBe(true);
		expect(isReady.value).toBe(true);
		expect(lastFetched.value).toBeInstanceOf(Date);
	});

	test("Leaves the record empty when the request fails", async () => {
		// The failing record query.
		const { haveRecord, isReady, lastFetched, record, refetch } = createDetail({
			id: "record-1",
			error: new Error("Request failed"),
		});

		await expect(refetch(true)).rejects.toThrow("Request failed");

		expect(record.value).toBe(null);
		expect(haveRecord.value).toBe(false);
		expect(isReady.value).toBe(false);
		expect(lastFetched.value).toBe(null);
	});

	test("Loads another record when the ID changes", async () => {
		// The reactive ID used by the query.
		const id = ref("record-1");

		// The query and API spy for the first record.
		const { get, record, refetch } = createDetail({
			id,
			response: { id: "record-1" },
		});

		await refetch(true);

		expect(record.value).toEqual({ id: "record-1", derived: {} });

		get.mockResolvedValue({ id: "record-2" });

		id.value = "record-2";

		await vi.waitFor(() => expect(record.value).toEqual({ id: "record-2", derived: {} }), {
			timeout: 500,
		});

		expect(get).toHaveBeenCalledWith("records/record-2");
	});
});
