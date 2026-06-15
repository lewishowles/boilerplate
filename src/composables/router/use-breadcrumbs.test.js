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
			route.name = "location";
			route.params = {};
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([]);
		});
	});

	describe("Static labels", () => {
		test("Uses static route meta labels", () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [
				{ name: "location", path: "/locations/:locationId", meta: { breadcrumb: "Location" } },
			];

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "location",
					label: "Location",
					loading: false,
					to: {
						name: "location",
						params: { locationId: "location-123" },
					},
				},
			]);
		});

		test("Marks the last rendered breadcrumb as current", () => {
			route.name = "dashboard";
			route.params = { siteId: "site-123" };
			route.matched = [
				{ name: undefined, path: "/site/:siteId", meta: { breadcrumb: "Site" } },
				{ name: "dashboard", path: "", meta: {} },
			];

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "/site/:siteId",
					label: "Site",
					loading: false,
					to: {
						path: "/site/site-123",
					},
				},
			]);
		});
	});

	describe("Dynamic labels", () => {
		test("Uses a registered breadcrumb label for the current route", () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Main gate");
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "location",
					label: "Main gate",
					loading: false,
					to: {
						name: "location",
						params: { locationId: "location-123" },
					},
				},
			]);

			scope.stop();
		});

		test("Updates when a reactive breadcrumb label changes", async () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const label = ref("Main gate");
			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb(label);
			});

			const breadcrumbs = useBreadcrumbs();

			label.value = "North entrance";

			await nextTick();

			expect(breadcrumbs.value[0].label).toBe("North entrance");

			scope.stop();
		});

		test("Updates when labels are registered after breadcrumbs are created", async () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const breadcrumbs = useBreadcrumbs();
			const scope = effectScope();

			expect(breadcrumbs.value).toEqual([]);

			scope.run(() => {
				useBreadcrumb("Main gate");
			});

			await nextTick();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "location",
					label: "Main gate",
					loading: false,
					to: {
						name: "location",
						params: { locationId: "location-123" },
					},
				},
			]);

			scope.stop();
		});

		test("Uses the fallback label when the registered label is not yet available", () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

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
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const label = ref(null);
			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb(label);
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: true,
					id: "location",
					label: "location",
					loading: true,
					to: {
						name: "location",
						params: { locationId: "location-123" },
					},
				},
			]);

			scope.stop();
		});

		test("Removes dynamic labels when the owning scope is disposed", async () => {
			route.name = "location";
			route.params = { locationId: "location-123" };
			route.matched = [{ name: "location", path: "/locations/:locationId", meta: {} }];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Main gate");
			});

			const breadcrumbs = useBreadcrumbs();

			scope.stop();

			await nextTick();

			expect(breadcrumbs.value).toEqual([]);
		});
	});

	describe("Route records", () => {
		test("Uses breadcrumb keys for unnamed parent records", () => {
			route.name = "location";
			route.params = {
				locationId: "location-456",
				siteId: "site-123",
			};
			route.matched = [
				{ name: undefined, path: "/site/:siteId", meta: { breadcrumbKey: "site" } },
				{ name: "location", path: "locations/:locationId", meta: {} },
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Main site", { name: "site" });
				useBreadcrumb("Main gate", { name: "location" });
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value).toEqual([
				{
					current: false,
					id: "site",
					label: "Main site",
					loading: false,
					to: {
						path: "/site/site-123",
					},
				},
				{
					current: true,
					id: "location",
					label: "Main gate",
					loading: false,
					to: {
						name: "location",
						params: {
							locationId: "location-456",
							siteId: "site-123",
						},
					},
				},
			]);

			scope.stop();
		});

		test("Only passes parameters declared by the breadcrumb route chain", () => {
			route.name = "location";
			route.params = {
				ignoredId: "ignored-789",
				locationId: "location-456",
				siteId: "site-123",
			};
			route.matched = [
				{ name: undefined, path: "/site/:siteId", meta: { breadcrumbKey: "site" } },
				{ name: "location", path: "locations/:locationId", meta: {} },
			];

			const scope = effectScope();

			scope.run(() => {
				useBreadcrumb("Main site", { name: "site" });
				useBreadcrumb("Main gate", { name: "location" });
			});

			const breadcrumbs = useBreadcrumbs();

			expect(breadcrumbs.value[0].to).toEqual({
				path: "/site/site-123",
			});
			expect(breadcrumbs.value[1].to).toEqual({
				name: "location",
				params: {
					locationId: "location-456",
					siteId: "site-123",
				},
			});

			scope.stop();
		});
	});
});
