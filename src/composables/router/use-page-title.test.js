import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { effectScope, nextTick, reactive, ref } from "vue";

import { usePageTitle, usePageTitles } from "./use-page-title";

const mockTitle = ref(null);

vi.mock("@vueuse/core", () => ({
	useTitle: vi.fn(() => mockTitle),
}));

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
			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Sites");
			});

			expect(mockTitle.value).toBe("Sites | App");

			scope.stop();
		});
	});

	describe("Dynamic titles", () => {
		test("Sets the document title from a ref", () => {
			const title = ref("Sites");
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			expect(mockTitle.value).toBe("Sites | App");

			scope.stop();
		});

		test("Updates the document title when the ref changes", async () => {
			const title = ref("Sites");
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			title.value = "Locations";

			await nextTick();

			expect(mockTitle.value).toBe("Locations | App");

			scope.stop();
		});

		test("Falls back to the route meta title when the title resolves to a falsy value", async () => {
			route.meta = { title: "Sites" };

			const title = ref("Locations");
			const scope = effectScope();

			scope.run(() => {
				usePageTitle(title);
			});

			title.value = null;

			await nextTick();

			expect(mockTitle.value).toBe("Sites | App");

			scope.stop();
		});

		test("Falls back to the base title when the title and route meta both resolve to falsy values", async () => {
			const title = ref("Sites");
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
			route.meta = { title: "Sites" };

			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Locations");
			});

			scope.stop();

			expect(mockTitle.value).toBe("Sites | App");
		});

		test("Restores the base title when the scope is disposed and no route meta title is set", () => {
			const scope = effectScope();

			scope.run(() => {
				usePageTitle("Sites");
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
			route.meta = { title: "Sites" };

			usePageTitles();

			expect(mockTitle.value).toBe("Sites | App");
		});

		test("Falls back to the base title when no route meta title is set", () => {
			usePageTitles();

			expect(mockTitle.value).toBe("App");
		});
	});

	describe("Route changes", () => {
		test("Updates the document title when the route meta title changes", async () => {
			route.meta = { title: "Sites" };

			usePageTitles();

			route.meta = { title: "Locations" };

			await nextTick();

			expect(mockTitle.value).toBe("Locations | App");
		});

		test("Falls back to the base title when the route meta title is removed", async () => {
			route.meta = { title: "Sites" };

			usePageTitles();

			route.meta = {};

			await nextTick();

			expect(mockTitle.value).toBe("App");
		});
	});
});
