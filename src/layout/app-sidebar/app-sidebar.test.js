import { createMount, mockRouter } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { ref } from "vue";

import AppSidebar from "./app-sidebar.vue";

// The logout action provided by the authentication query.
const mockLogout = vi.hoisted(() => vi.fn());
// Whether the current user is available.
const mockHaveUser = ref(false);
// The current user's details.
const mockUserDetails = ref(null);

vi.mock("@/queries/auth", () => ({
	/**
	 * Returns the mocked authentication actions.
	 *
	 * @returns  {object}
	 *     The mocked authentication interface.
	 */
	useAuth: () => ({ logout: mockLogout }),
	/**
	 * Returns the mocked current-user state.
	 *
	 * @returns  {object}
	 *     The mocked current-user interface.
	 */
	useCurrentUser: () => ({
		haveUser: mockHaveUser,
		userDetails: mockUserDetails,
	}),
}));

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

// Mount the sidebar with the authentication query replaced by test state.
const mount = createMount(AppSidebar);

describe("app-sidebar", () => {
	beforeEach(() => {
		mockHaveUser.value = false;
		mockUserDetails.value = null;

		vi.clearAllMocks();

		// The menu matches each named link to the current page by its path, so
		// resolve each name to a path the way the router would.
		mockRouter.resolve.mockImplementation((to) => ({ path: `/${to.name}` }));
	});

	describe("Computed", () => {
		test("Reads the signed-in user's display name", () => {
			mockHaveUser.value = true;
			mockUserDetails.value = { display_name: "Sophie Wardhaugh" };

			// Rendered sidebar under test.
			const wrapper = mount();

			expect(wrapper.vm.userName).toBe("Sophie Wardhaugh");
		});

		test("Returns no user display name when user details are unavailable", () => {
			// Rendered sidebar without user details.
			const wrapper = mount();

			expect(wrapper.vm.userName).toBeUndefined();
		});
	});
});
