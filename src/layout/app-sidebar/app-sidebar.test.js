import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { reactive, ref } from "vue";

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

// The page the sidebar menu treats as currently open.
const mockRoute = vi.hoisted(() => ({ path: "/" }));
// The current page, made reactive so the menu responds like a real route.
const reactiveRoute = reactive(mockRoute);
// Turns a named menu link into a path, the way the router would.
const mockResolve = vi.hoisted(() => vi.fn((to) => ({ path: `/${to.name}` })));

vi.mock("vue-router", async (importOriginal) => {
	// The real router module, kept for everything the sidebar does not need
	// replaced.
	const actual = await importOriginal();

	return {
		...actual,
		/**
		 * Returns the mocked current page.
		 *
		 * @returns  {object}
		 *     The mocked route.
		 */
		useRoute: () => reactiveRoute,
		/**
		 * Returns a router that can only resolve menu links.
		 *
		 * @returns  {object}
		 *     The mocked router.
		 */
		useRouter: () => ({ resolve: mockResolve }),
	};
});

// Mount the sidebar with the authentication query replaced by test state.
const mount = createMount(AppSidebar);

describe("app-sidebar", () => {
	beforeEach(() => {
		mockHaveUser.value = false;
		mockUserDetails.value = null;
		vi.clearAllMocks();
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
