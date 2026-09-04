import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { effectScope, nextTick, reactive, ref } from "vue";

import { usePageTitle, usePageTitles } from "./use-page-title";

// Reactive document title returned by the VueUse stub.
const mockTitle = ref(null);

vi.mock("@vueuse/core", () => ({
	useTitle: vi.fn(() => mockTitle),
}));

// Reactive route used by the Vue Router stub.
const route = reactive({ meta: {} });

vi.mock("vue-router", () => ({
	useRoute: vi.fn(() => route),
}));

describe("usePageTitle", () => {
	beforeEach(() => {
		mockTitle.value = null;
		route.meta = {};
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
			route.meta = { page_title: "Sample page one" };

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
			route.meta = { page_title: "Sample page one" };

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
		route.meta = {};
	});

	describe("Initialisation", () => {
		test("Applies the route meta title on mount", () => {
			route.meta = { page_title: "Sample page one" };

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
			route.meta = { page_title: "Sample page one" };

			usePageTitles();

			route.meta = { page_title: "Sample page two" };

			await nextTick();

			expect(mockTitle.value).toBe("Sample page two | App");
		});

		test("Falls back to the base title when the route meta title is removed", async () => {
			route.meta = { page_title: "Sample page one" };

			usePageTitles();

			route.meta = {};

			await nextTick();

			expect(mockTitle.value).toBe("App");
		});
	});
});
