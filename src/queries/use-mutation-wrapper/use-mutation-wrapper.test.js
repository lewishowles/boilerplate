import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";

import { useMutationWrapper } from "./use-mutation-wrapper";

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
		useQueryCache: () => ({
			invalidateQueries: mockInvalidateQueries,
		}),
	};
});

/**
 * Create the mutation wrapper in a Vue app context.
 *
 * @param  {object}  options
 *     The mutation wrapper options.
 *
 * @returns  {object}
 *     The configured mutation.
 */
function createMutation(options) {
	return withAppContext(() => useMutationWrapper(options));
}

describe("useMutationWrapper", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialisation", () => {
		test("Returns a mutateAsync function", () => {
			// Mutation returned by the test wrapper.
			const mutation = createMutation({
				mutation: vi.fn(),
			});

			expect(mutation.mutateAsync).toBeTypeOf("function");
		});
	});

	describe("Invalidation", () => {
		test("Invalidates a static query after success", async () => {
			// Mutation returned by the test wrapper.
			const mutation = createMutation({
				invalidates: ["examples"],
				mutation: vi.fn().mockResolvedValue({ id: "example-1" }),
			});

			await mutation.mutateAsync({ name: "Example 1" });

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
		});

		test("Invalidates query options derived from mutation variables", async () => {
			// Mutation returned by the test wrapper.
			const mutation = createMutation({
				/**
				 * Builds the query keys that depend on the mutation result.
				 *
				 * @param  {object}  options
				 *     The invalidation options.
				 * @param  {string|number}  options.id
				 *     The mutated record identifier.
				 *
				 * @returns  {object[][]}
				 *     The affected query keys.
				 */
				invalidates: ({ id }) => [["examples"], ["examples", id]],
				mutation: vi.fn().mockResolvedValue({ id: "example-1" }),
			});

			await mutation.mutateAsync({ id: "example-1", name: "Example 1" });

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples", "example-1"] });
		});

		test("Runs caller onSettled before invalidating queries", async () => {
			// Recorded callback and invalidation order.
			const calls = [];
			// Caller settlement callback recorded for assertion.
			const onSettled = vi.fn(() => calls.push("settled"));

			mockInvalidateQueries.mockImplementation(() => calls.push("invalidated"));

			// Mutation returned by the test wrapper.
			const mutation = createMutation({
				invalidates: ["examples"],
				mutation: vi.fn().mockResolvedValue({ id: "example-1" }),
				onSettled,
			});

			await mutation.mutateAsync({ id: "example-1" });

			expect(onSettled).toHaveBeenCalledWith(
				{ id: "example-1" },
				undefined,
				{ id: "example-1" },
				expect.objectContaining({ entry: expect.any(Object) }),
			);
			expect(calls).toEqual(["settled", "invalidated"]);
		});

		test("Invalidates queries when the mutation fails", async () => {
			// Mutation returned by the test wrapper.
			const mutation = createMutation({
				invalidates: ["examples"],
				mutation: vi.fn().mockRejectedValue(new Error("Request failed")),
			});

			await expect(mutation.mutateAsync({ id: "example-1" })).rejects.toThrow("Request failed");

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
		});
	});
});
