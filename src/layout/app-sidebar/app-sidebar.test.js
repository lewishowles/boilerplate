import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";
import AppSidebar from "./app-sidebar.vue";

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

describe("app-sidebar", () => {
	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});
});
