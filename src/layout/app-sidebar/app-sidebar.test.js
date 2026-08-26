import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { ref } from "vue";

import AppSidebar from "./app-sidebar.vue";

// The logout action provided by the authentication query.
const mockLogout = vi.hoisted(() => vi.fn());
// Whether the current user is available.
const mockHaveUser = ref(false);
// The current user's details.
const mockUserDetails = ref(null);

vi.mock("@/queries/auth", () => ({
	useAuth: () => ({ logout: mockLogout }),
	useCurrentUser: () => ({
		haveUser: mockHaveUser,
		userDetails: mockUserDetails,
	}),
}));

// Mount the sidebar with the authentication query replaced by test state.
const mount = createMount(AppSidebar);

describe("app-sidebar", () => {
	beforeEach(() => {
		mockHaveUser.value = false;
		mockUserDetails.value = null;
		vi.clearAllMocks();
	});

	describe("Computed", () => {
		test("Reads the signed-in user's email address", () => {
			mockHaveUser.value = true;
			mockUserDetails.value = { email: "sophie.wardhaugh@example.com" };

			const wrapper = mount();

			expect(wrapper.vm.userName).toBe("sophie.wardhaugh@example.com");
		});

		test("Returns no user email when user details are unavailable", () => {
			const wrapper = mount();

			expect(wrapper.vm.userName).toBeUndefined();
		});
	});
});
