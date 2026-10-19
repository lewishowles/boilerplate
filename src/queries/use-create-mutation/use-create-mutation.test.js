import { useCreateMutation } from "./use-create-mutation";
import { withAppContext } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { ref } from "vue";

// Mocked query-cache invalidation method.
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@pinia/colada", async (importOriginal) => {
	// Original Pinia Colada module, used to retain unaffected exports.
	const actual = await importOriginal();

	return {
		...actual,
		/**
		 * Return a query cache with the mocked invalidation method.
		 *
		 * @returns  {object}
		 *     The mocked query cache.
		 */
		useQueryCache: () => ({ invalidateQueries: mockInvalidateQueries }),
	};
});

/**
 * Create a domain mutation with a test API in a Vue app context.
 *
 * @param  {object}  [options]
 *     Settings for the test request.
 * @param  {Error}  [options.error]
 *     The error the test API rejects with.
 * @param  {Function}  [options.prepare]
 *     The domain's form value mapper.
 * @param  {object}  [options.response]
 *     The response returned by the test API.
 *
 * @returns  {object}
 *     The mutation and its API and mapper spies.
 */
function createMutation({ error, prepare = (parameters) => parameters, response } = {}) {
	// The API request, which fails with the error or returns the response.
	const post = error ? vi.fn().mockRejectedValue(error) : vi.fn().mockResolvedValue(response);
	// The domain's form value mapper.
	const prepareValues = vi.fn(prepare);

	// The domain definition passed to the create mutation.
	const domain = {
		api: { post },
		endpoint: "records",
		keys: { root: ["records"] },
		prepare: prepareValues,
	};

	// The mutation created inside the app context.
	const mutation = withAppContext(() => useCreateMutation({ domain }));

	return { mutation, post, prepareValues };
}

describe("useCreateMutation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("Posts prepared values without changing the submitted form values", async () => {
		// Form values passed as a ref to the mutation.
		const parameters = ref({ name: "Example" });
		// Response returned by the create request.
		const response = { id: "record-1" };

		// Mutation with a mapper that changes its input copy.
		const { mutation, post, prepareValues } = createMutation({
			/**
			 * Map the form name into the API field on the copied values.
			 *
			 * @param  {object}  values
			 *     The form values to prepare.
			 *
			 * @returns  {object}
			 *     The prepared API values.
			 */
			prepare: (values) => {
				values.title = values.name;
				delete values.name;

				return values;
			},
			response,
		});

		await expect(mutation.mutateAsync(parameters)).resolves.toEqual(response);

		expect(prepareValues.mock.calls[0][0]).not.toBe(parameters.value);
		expect(post).toHaveBeenCalledWith("records", { title: "Example" });
		expect(parameters.value).toEqual({ name: "Example" });
		expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["records"] });
		expect(mutation.data.value).toEqual(response);
	});

	test("Propagates request errors and refreshes the domain's cached queries after the request fails", async () => {
		// Request error returned by the API.
		const error = new Error("Request failed");
		// Mutation and API spy for the failing request.
		const { mutation, post } = createMutation({ error });

		await expect(mutation.mutateAsync({ name: "Example" })).rejects.toBe(error);

		expect(post).toHaveBeenCalledWith("records", { name: "Example" });
		expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["records"] });
	});
});
