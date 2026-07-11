import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { withAppContext } from "@lewishowles/testing/vue";

import { useMutationWrapper } from "./use-mutation-wrapper";

const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock("@pinia/colada", async (importOriginal) => {
	const actual = await importOriginal();

	return {
		...actual,
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
			const mutation = createMutation({
				mutation: vi.fn(),
			});

			expect(mutation.mutateAsync).toBeTypeOf("function");
		});
	});

	describe("Invalidation", () => {
		test("Invalidates a static query after success", async () => {
			const mutation = createMutation({
				invalidates: ["examples"],
				mutation: vi.fn().mockResolvedValue({ id: "example-1" }),
			});

			await mutation.mutateAsync({ name: "Example 1" });

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
		});

		test("Invalidates query options derived from mutation variables", async () => {
			const mutation = createMutation({
				invalidates: ({ id }) => [["examples"], ["examples", id]],
				mutation: vi.fn().mockResolvedValue({ id: "example-1" }),
			});

			await mutation.mutateAsync({ id: "example-1", name: "Example 1" });

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples", "example-1"] });
		});

		test("Runs caller onSettled before invalidating queries", async () => {
			const calls = [];
			const onSettled = vi.fn(() => calls.push("settled"));

			mockInvalidateQueries.mockImplementation(() => calls.push("invalidated"));

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
			const mutation = createMutation({
				invalidates: ["examples"],
				mutation: vi.fn().mockRejectedValue(new Error("Request failed")),
			});

			await expect(mutation.mutateAsync({ id: "example-1" })).rejects.toThrow("Request failed");

			expect(mockInvalidateQueries).toHaveBeenCalledWith({ key: ["examples"] });
		});
	});
});
