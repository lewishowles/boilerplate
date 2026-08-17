import { describe, expect, test, vi } from "vite-plus/test";
import { effectScope, nextTick, reactive, ref } from "vue";

import { useBreadcrumb, useBreadcrumbs } from "./use-breadcrumbs";

const route = reactive({
	matched: [],
	name: null,
	params: {},
});

vi.mock("vue-router", () => ({
	useRoute: vi.fn(() => route),
}));

describe("useBreadcrumbs", () => {
	describe("Initialisation", () => {
		test("Returns no breadcrumbs when no matched records provide labels", () => {
			route.name = "sample-page-one";
			route.params = {};
			route.matched = [{ name: "sample-page-one", path: "/sample-pages", meta: {} }];

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([]);
		});
	});

	describe("Static labels", () => {
		test("Uses static breadcrumb meta labels", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: { breadcrumb: { label: "Sample page one" } },
				},
			];

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

		test("Uses page titles as static labels", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: { page_title: "Sample page one" },
				},
			];

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

		test("Marks the last rendered breadcrumb as current", () => {
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

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "sample-page-one",
					label: "Sample page one",
					loading: false,
					to: {
						name: "sample-page-one",
						params: {},
					},
				},
			]);
		});
	});

	describe("Dynamic labels", () => {
		test("Uses a registered breadcrumb label for the current route", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Sample page one");
			});

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

			scope.stop();
		});

		test("Updates when a reactive breadcrumb label changes", async () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const label = ref("Sample page one");
			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb(label);
			});

			const breadcrumbs = useBreadcrumbs();

			label.value = "Sample page two";

			await nextTick();

			expect(breadcrumbs.value[0].label).toBe("Sample page two");

			scope.stop();
		});

		test("Updates when labels are registered after breadcrumbs are created", async () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const breadcrumbs = useBreadcrumbs();
			const scope = effectScope();

			expect(breadcrumbs.value).toEqual([]);

			scope.run(() => {
				useBreadcrumb("Sample page one");
			});

			await nextTick();

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

			scope.stop();
		});

		test("Uses the fallback label when the registered label is not yet available", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const label = ref(null);
			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb(label, { fallback: "Loading…" });
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].label).toBe("Loading…");
			expect(breadcrumbs.value[0].loading).toBe(false);

			scope.stop();
		});

		test("Shows loading state when a registered label is not available", () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const label = ref(null);
			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb(label);
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "sample-page-one",
					label: "sample-page-one",
					loading: true,
					to: {
						name: "sample-page-one",
						params: { samplePageId: "sample-123" },
					},
				},
			]);

			scope.stop();
		});

		test("Removes dynamic labels when the owning scope is disposed", async () => {
			route.name = "sample-page-one";
			route.params = { samplePageId: "sample-123" };
			route.matched = [
				{
					name: "sample-page-one",
					path: "/sample-pages/:samplePageId",
					meta: {},
				},
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Sample page one");
			});

			const breadcrumbs = useBreadcrumbs();

			scope.stop();

			await nextTick();

			expect(breadcrumbs.value).toEqual([]);
		});
	});

	describe("Route records", () => {
		test("Uses an index child for a componentless parent record", () => {
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

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: false,
					id: "sample-page-one",
					label: "Sample page one",
					loading: false,
					to: {
						name: "sample-page-one",
						params: {},
					},
				},
				{
					current: true,
					id: "sample-page-two",
					label: "Sample page two",
					loading: false,
					to: {
						name: "sample-page-two",
						params: { samplePageId: "sample-123" },
					},
				},
			]);
		});

		test("Uses an explicit destination for a parent breadcrumb", () => {
			route.name = "sample-page-two";
			route.params = { samplePageId: "sample-123" };
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
					path: "/sample-pages/:samplePageId",
					meta: { breadcrumb: { label: "Sample page two" } },
				},
			];

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				name: "sample-page-one",
			});
		});

		test("Uses breadcrumb keys for unnamed parent records", () => {
			route.name = "sample-page-two";
			route.params = {
				samplePageOneId: "sample-123",
				samplePageTwoId: "sample-456",
			};
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages/:samplePageOneId",
					meta: { breadcrumbKey: "sample-page-one" },
				},
				{
					name: "sample-page-two",
					path: "children/:samplePageTwoId",
					meta: {},
				},
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Sample page one", { name: "sample-page-one" });
				useBreadcrumb("Sample page two", { name: "sample-page-two" });
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: false,
					id: "sample-page-one",
					label: "Sample page one",
					loading: false,
					to: {
						path: "/sample-pages/sample-123",
					},
				},
				{
					current: true,
					id: "sample-page-two",
					label: "Sample page two",
					loading: false,
					to: {
						name: "sample-page-two",
						params: {
							samplePageOneId: "sample-123",
							samplePageTwoId: "sample-456",
						},
					},
				},
			]);

			scope.stop();
		});

		test("Only passes parameters declared by the breadcrumb route chain", () => {
			route.name = "sample-page-two";
			route.params = {
				ignoredId: "ignored-789",
				samplePageOneId: "sample-123",
				samplePageTwoId: "sample-456",
			};
			route.matched = [
				{
					name: undefined,
					path: "/sample-pages/:samplePageOneId",
					meta: { breadcrumbKey: "sample-page-one" },
				},
				{
					name: "sample-page-two",
					path: "children/:samplePageTwoId",
					meta: {},
				},
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Sample page one", { name: "sample-page-one" });
				useBreadcrumb("Sample page two", { name: "sample-page-two" });
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				path: "/sample-pages/sample-123",
			});
			expect(breadcrumbs.value[1].to).toEqual({
				name: "sample-page-two",
				params: {
					samplePageOneId: "sample-123",
					samplePageTwoId: "sample-456",
				},
			});

			scope.stop();
		});
	});
});
