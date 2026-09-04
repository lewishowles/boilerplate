import { describe, expect, test, vi } from "vite-plus/test";

import composeMiddleware from ".";

describe("composeMiddleware", () => {
	describe("Execution", () => {
		test("Runs all guards when none return a value", async () => {
			// First middleware guard.
			const guardA = vi.fn();
			// Second middleware guard.
			const guardB = vi.fn();

			await composeMiddleware(guardA, guardB)({}, {});

			expect(guardA).toHaveBeenCalled();
			expect(guardB).toHaveBeenCalled();
		});

		test("Passes to and from to each guard", async () => {
			// Destination route passed to the middleware.
			const to = { path: "/dashboard" };
			// Source route passed to the middleware.
			const from = { path: "/login" };
			// Middleware guard that records the routes.
			const guard = vi.fn();

			await composeMiddleware(guard)(to, from);

			expect(guard).toHaveBeenCalledWith(to, from);
		});

		test("Returns the result of the first guard that returns a value", async () => {
			// First middleware guard that redirects to login.
			const guardA = vi.fn(() => ({ name: "login" }));
			// Second middleware guard.
			const guardB = vi.fn();

			// Result returned by the middleware handler.
			const result = await composeMiddleware(guardA, guardB)({}, {});

			expect(result).toEqual({ name: "login" });
		});

		test("Does not run subsequent guards after one returns a value", async () => {
			// First middleware guard that redirects to login.
			const guardA = vi.fn(() => ({ name: "login" }));
			// Second middleware guard.
			const guardB = vi.fn();

			await composeMiddleware(guardA, guardB)({}, {});

			expect(guardB).not.toHaveBeenCalled();
		});

		test("Returns undefined when all guards pass", async () => {
			// First middleware guard.
			const guardA = vi.fn();
			// Second middleware guard.
			const guardB = vi.fn();

			// Result returned by the middleware handler.
			const result = await composeMiddleware(guardA, guardB)({}, {});

			expect(result).toBeUndefined();
		});
	});
});
