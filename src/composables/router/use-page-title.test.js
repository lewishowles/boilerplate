import { usePageTitle, usePageTitles } from "./use-page-title";
import { setRoute } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { effectScope, nextTick, ref } from "vue";

// Reactive document title returned by the VueUse stub.
const mockTitle = ref(null);

vi.mock("@vueuse/core", () => ({
	useTitle: vi.fn(() => mockTitle),
}));

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

describe("usePageTitle", () => {
	beforeEach(() => {
		mockTitle.value = null;
	});

	describe("Static titles", () => {
		test("Sets the document title from a plain string", () => {
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Sample page one");
			});

			expect(mockTitle.value).toBe("Sample page one | App");

			scope.stop();
		});
	});

	describe("Dynamic titles", () => {
		test("Sets the document title from a ref", () => {
			// Reactive title supplied to the composable.
			const title = ref("Sample page one");
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			expect(mockTitle.value).toBe("Sample page one | App");

			scope.stop();
		});

		test("Updates the document title when the ref changes", async () => {
			// Reactive title supplied to the composable.
			const title = ref("Sample page one");
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			title.value = "Sample page two";

			await nextTick();

			expect(mockTitle.value).toBe("Sample page two | App");

			scope.stop();
		});

		test("Falls back to the route meta title when the title resolves to a falsy value", async () => {
			setRoute({ meta: { page_title: "Sample page one" } });

			// Reactive title supplied to the composable.
			const title = ref("Sample page two");
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			title.value = null;

			await nextTick();

			expect(mockTitle.value).toBe("Sample page one | App");

			scope.stop();
		});

		test("Falls back to the base title when the title and route meta both resolve to falsy values", async () => {
			// Reactive title supplied to the composable.
			const title = ref("Sample page one");
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			title.value = null;

			await nextTick();

			expect(mockTitle.value).toBe("App");

			scope.stop();
		});
	});

	describe("Cleanup", () => {
		test("Restores the route meta title when the scope is disposed", () => {
			setRoute({ meta: { page_title: "Sample page one" } });

			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Sample page two");
			});

			scope.stop();

			expect(mockTitle.value).toBe("Sample page one | App");
		});

		test("Restores the base title when the scope is disposed and no route meta title is set", () => {
			// Scope used to dispose the title effect.
			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Sample page one");
			});

			scope.stop();

			expect(mockTitle.value).toBe("App");
		});
	});
});

describe("usePageTitles", () => {
	beforeEach(() => {
		mockTitle.value = null;
	});

	describe("Initialisation", () => {
		test("Applies the route meta title on mount", () => {
			setRoute({ meta: { page_title: "Sample page one" } });

			usePageTitles();

			expect(mockTitle.value).toBe("Sample page one | App");
		});

		test("Falls back to the base title when no route meta title is set", () => {
			usePageTitles();

			expect(mockTitle.value).toBe("App");
		});
	});

	describe("Route changes", () => {
		test("Updates the document title when the route meta title changes", async () => {
			setRoute({ meta: { page_title: "Sample page one" } });

			usePageTitles();

			setRoute({ meta: { page_title: "Sample page two" } });

			await nextTick();

			expect(mockTitle.value).toBe("Sample page two | App");
		});

		test("Falls back to the base title when the route meta title is removed", async () => {
			setRoute({ meta: { page_title: "Sample page one" } });

			usePageTitles();

			setRoute({ meta: {} });

			await nextTick();

			expect(mockTitle.value).toBe("App");
		});
	});
});
