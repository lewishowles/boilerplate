import { createMount } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import PageTitle from "./page-title.vue";

const mockBreadcrumbs = vi.hoisted(() => ({ value: [] }));
const mockResolve = vi.hoisted(() => vi.fn((to) => ({ href: `/${to.name}` })));

vi.mock("@/composables/router/use-breadcrumbs", () => ({
	useBreadcrumbs: () => mockBreadcrumbs,
}));

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	useRouter: () => ({ resolve: mockResolve }),
}));

const mount = createMount(PageTitle);

describe("page-title", () => {
	beforeEach(() => {
		mockBreadcrumbs.value = [];
		vi.clearAllMocks();
	});

	describe("Render contracts", () => {
		test("Does not render introduction content by default", () => {
			const wrapper = mount();

			expect(wrapper.find("p").exists()).toBe(false);
		});

		test("Renders introduction content when the introduction slot is filled", () => {
			const wrapper = mount({
				slots: {
					introduction: "Page introduction",
				},
			});

			expect(wrapper.get("p").text()).toBe("Page introduction");
		});

		test("Does not render a single breadcrumb", () => {
			mockBreadcrumbs.value = [
				{ current: true, id: "page", label: "Page one", to: { name: "page-one" } },
			];

			const wrapper = mount();

			expect(wrapper.find("breadcrumb-list-stub").exists()).toBe(false);
		});

		test("Renders a breadcrumb trail with more than one item", () => {
			mockBreadcrumbs.value = [
				{ current: false, id: "section", label: "Section one", to: { name: "section" } },
				{ current: true, id: "page", label: "Page one", to: { name: "page" } },
			];

			const wrapper = mount();

			expect(wrapper.find("breadcrumb-list-stub").exists()).toBe(true);
		});

		test("Allows the breadcrumb content to be overridden", () => {
			mockBreadcrumbs.value = [
				{ current: true, id: "page", label: "Page one", to: { name: "page-one" } },
			];

			const wrapper = mount({
				slots: {
					breadcrumbs: "Custom breadcrumb",
				},
			});

			expect(wrapper.text()).toContain("Custom breadcrumb");
		});
	});
});
