import { describe, expect, test, vi } from "vite-plus/test";
import { effectScope, nextTick, reactive, ref } from "vue";

import { useBreadcrumb, useBreadcrumbs } from "./use-breadcrumbs";

// Reactive route used by the Vue Router stub.
const route = reactive({
	matched: [],
	name: null,
	params: {},
});

vi.mock("vue-router", () => ({
	useRoute: vi.fn(() => route),
}));

/**
 * Register a breadcrumb in an isolated effect scope.
 *
 * @param  {string|object}  label
 *     The breadcrumb label to register.
 * @param  {object}  options
 *     Breadcrumb registration options.
 *
 * @returns  {object}
 *     Scope that owns the breadcrumb registration.
 */
function registerBreadcrumb(label, options) {
	// Scope that owns the registered breadcrumb effect.
	const scope = effectScope();

	scope.run(() => {
		useBreadcrumb(label, options);
	});

	return scope;
}

describe("useBreadcrumbs", () => {
	describe("Labels", () => {
		test("Omits routes without breadcrumb labels", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([]);
		});

		test("Builds a breadcrumb from meta.breadcrumb.label", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: { breadcrumb: { label: "Sample page one" } },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "sample-page-one",
					label: "Sample page one",
					loading: false,
					to: {
						name: "sample-page-one",
						params: { samplePageId: "sample-123" },
					},
				},
			]);
		});

		test("Falls back to meta.page_title for the label", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: { page_title: "Sample page one" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Sample page one");
		});

		test("Marks the last rendered breadcrumb as current when later routes are omitted", () => {
			route.name = "sample-page-two";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: { page_title: "Sample page one" },
				},
				{
					name: "sample-page-two",
					path: "",
					meta: {},
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value.map(({ current, id }) => ({ current, id }))).toEqual([
				{
					current: true,
					id: "sample-page-one",
				},
			]);
		});
	});

	describe("Dynamic labels", () => {
		test("Uses a registered label for the current route", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb("Sample page one");
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Sample page one");

			scope.stop();
		});

		test("Prefers a registered label to static labels", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {
						breadcrumb: { label: "Static breadcrumb" },
						page_title: "Static page title",
					},
				},
			];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb("Dynamic breadcrumb");
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Dynamic breadcrumb");

			scope.stop();
		});

		test("Updates when a registered label changes", async () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Reactive breadcrumb label used to test updates.
			const label = ref("Sample page one");
			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb(label);
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			label.value = "Sample page two";

			await nextTick();

			expect(breadcrumbs.value[0].label).toBe("Sample page two");

			scope.stop();
		});

		test("Reacts to labels registered after initialisation", async () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([]);

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb("Sample page one");

			await nextTick();

			expect(breadcrumbs.value[0].label).toBe("Sample page one");

			scope.stop();
		});

		test("Uses the fallback while a registered label is unavailable", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb(ref(null), {
				fallback: "Loading…",
			});

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Loading…");
			expect(breadcrumbs.value[0].loading).toBe(true);

			scope.stop();
		});

		test("Marks an unavailable registered label as loading", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: { page_title: "Sample page one" },
				},
			];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb(ref(null));
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Sample page one");
			expect(breadcrumbs.value[0].loading).toBe(true);

			scope.stop();
		});

		test("Removes a registered label when its scope is disposed", async () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {},
				},
			];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb("Sample page one");
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			scope.stop();

			await nextTick();

			expect(breadcrumbs.value).toEqual([]);
		});

		test("Removes the previous registration when the route key changes", async () => {
			// First route record used to test key changes.
			const samplePageOne = {
				name: "sample-page-one",
				path: "/sample-pages/one",
				meta: {},
			};

			// Second route record used to test key changes.
			const samplePageTwo = {
				name: "sample-page-two",
				path: "/sample-pages/two",
				meta: {},
			};

			route.name = "sample-page-one";
			route.params = {};
			route.matched = [samplePageOne];

			// Scope that owns the registered breadcrumb.
			const scope = registerBreadcrumb("Sample page");
			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			route.name = "sample-page-two";
			route.matched = [samplePageTwo];

			await nextTick();

			expect(breadcrumbs.value[0].id).toBe("sample-page-two");

			scope.stop();

			route.name = "sample-page-one";
			route.matched = [samplePageOne];

			await nextTick();

			expect(breadcrumbs.value).toEqual([]);
		});
	});

	describe("Route hierarchy", () => {
		test("Uses the index child as the parent breadcrumb for sibling routes", () => {
			route.name = "sample-page-two";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages",
					meta: {},
					children: [
						{
							name: "sample-page-one",
							path: "",
							meta: { page_title: "Sample page one" },
						},
					],
				},
				{
					name: "sample-page-two",
					path: ":samplePageId",
					meta: { page_title: "Sample page two" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value.map(({ current, id }) => ({ current, id }))).toEqual([
				{
					current: false,
					id: "sample-page-one",
				},
				{
					current: true,
					id: "sample-page-two",
				},
			]);
		});

		test("Does not duplicate an index child when it is already matched", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages",
					meta: {},
					children: [
						{
							name: "sample-page-one",
							path: "",
							meta: { page_title: "Sample page one" },
						},
					],
				},
				{
					name: "sample-page-one",
					path: "",
					meta: { page_title: "Sample page one" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value.map(({ id }) => id)).toEqual(["sample-page-one"]);
		});

		test("Uses breadcrumbKey for unnamed routes", () => {
			route.name = "sample-page-two";
			route.params = {};
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages",
					meta: { breadcrumbKey: "sample-page-one" },
				},
				{
					name: "sample-page-two",
					path: "children",
					meta: {},
				},
			];

			// Scope that owns the parent breadcrumb.
			const parentScope = registerBreadcrumb("Sample page one", {
				key: "sample-page-one",
			});

			// Scope that owns the child breadcrumb.
			const childScope = registerBreadcrumb("Sample page two", {
				key: "sample-page-two",
			});

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value.map(({ id }) => id)).toEqual(["sample-page-one", "sample-page-two"]);

			parentScope.stop();
			childScope.stop();
		});
	});

	describe("Destinations", () => {
		test("Uses meta.breadcrumb.to as the destination", () => {
			route.name = "sample-page-two";
			route.params = {};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages",
					meta: {
						breadcrumb: {
							label: "Sample page one",
							to: { name: "sample-page-one" },
						},
					},
				},
				{
					name: "sample-page-two",
					path: "children",
					meta: { page_title: "Sample page two" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				name: "sample-page-one",
			});
		});

		test("Builds a path for unnamed breadcrumb routes", () => {
			route.name = "sample-page-two";
			route.params = {
				samplePageOneId: "sample-123",
			};
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages/:samplePageOneId",
					meta: {
						breadcrumbKey: "sample-page-one",
						page_title: "Sample page one",
					},
				},
				{
					name: "sample-page-two",
					path: "children",
					meta: { page_title: "Sample page two" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				path: "/sample-pages/sample-123",
			});
		});

		test("Excludes unrelated parameters from breadcrumb links", () => {
			route.name = "sample-page-two";
			route.params = {
				ignoredId: "ignored-789",
				samplePageOneId: "sample-123",
				samplePageTwoId: "sample-456",
			};
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageOneId",
					meta: { page_title: "Sample page one" },
				},
				{
					name: "sample-page-two",
					path: "children/:samplePageTwoId",
					meta: { page_title: "Sample page two" },
				},
			];

			// Breadcrumbs under test.
			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				name: "sample-page-one",
				params: {
					samplePageOneId: "sample-123",
				},
			});

			expect(breadcrumbs.value[1].to).toEqual({
				name: "sample-page-two",
				params: {
					samplePageOneId: "sample-123",
					samplePageTwoId: "sample-456",
				},
			});
		});
	});
});
