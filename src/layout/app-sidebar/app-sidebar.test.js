import { createMount } from "@lewishowles/testing/vue";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import AppSidebar from "./app-sidebar.vue";
import { useSidebar } from "@/composables/layout/use-sidebar";

const mockLogout = vi.hoisted(() => vi.fn());

vi.mock("@/queries/auth", () => ({
	useAuth: () => ({
		logout: mockLogout,
	}),
	useCurrentUser: () => ({
		haveUser: { value: false },
		userDetails: { value: null },
	}),
}));

const mount = createMount(AppSidebar);
const { showSidebar } = useSidebar();

describe("app-sidebar", () => {
	afterEach(() => {
		showSidebar.value = true;
	});

	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});

	describe("Render contracts", () => {
		test("Keeps the sidebar visible when alwaysVisible is true", () => {
			showSidebar.value = false;
			const wrapper = mount({ props: { alwaysVisible: true } });

			expect(wrapper.find("aside").classes()).not.toContain("sr-only");
			expect(wrapper.find("aside").classes()).not.toContain("max-lg:hidden");
		});

		test("Hides the sidebar by default when it is closed", () => {
			showSidebar.value = false;
			const wrapper = mount();

			expect(wrapper.find("aside").classes()).toContain("sr-only");
		});

		test("Hides the sidebar below the desktop breakpoint unless alwaysVisible is true", () => {
			const wrapper = mount();

			expect(wrapper.find("aside").classes()).toContain("max-lg:hidden");
		});
	});
});
