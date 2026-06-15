import { describe, expect, test, vi } from "vite-plus/test";

import composeMiddleware from ".";

describe("composeMiddleware", () => {
	describe("Execution", () => {
		test("Runs all guards when none return a value", async () => {
			const guardA = vi.fn();
			const guardB = vi.fn();

			await composeMiddleware(guardA, guardB)({}, {});

			expect(guardA).toHaveBeenCalled();
			expect(guardB).toHaveBeenCalled();
		});

		test("Passes to and from to each guard", async () => {
			const to = { path: "/dashboard" };
			const from = { path: "/login" };
			const guard = vi.fn();

			await composeMiddleware(guard)(to, from);

			expect(guard).toHaveBeenCalledWith(to, from);
		});

		test("Returns the result of the first guard that returns a value", async () => {
			const guardA = vi.fn(() => ({ name: "login" }));
			const guardB = vi.fn();

			const result = await composeMiddleware(guardA, guardB)({}, {});

			expect(result).toEqual({ name: "login" });
		});

		test("Does not run subsequent guards after one returns a value", async () => {
			const guardA = vi.fn(() => ({ name: "login" }));
			const guardB = vi.fn();

			await composeMiddleware(guardA, guardB)({}, {});

			expect(guardB).not.toHaveBeenCalled();
		});

		test("Returns undefined when all guards pass", async () => {
			const guardA = vi.fn();
			const guardB = vi.fn();

			const result = await composeMiddleware(guardA, guardB)({}, {});

			expect(result).toBeUndefined();
		});
	});
});
