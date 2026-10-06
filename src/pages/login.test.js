import { createMount, mockRouter, setRoute } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { ref } from "vue";

import Login from "./login.vue";

// Mocked sign-in action.
const mockLogin = vi.hoisted(() => vi.fn());
// Mocked sign-in error state.
const mockErrorMessage = ref(null);

vi.mock("@/queries/auth", () => ({
	/**
	 * Returns the mocked authentication state.
	 *
	 * @returns  {object}
	 *     The mocked authentication interface.
	 */
	useAuth: () => ({
		errorMessage: mockErrorMessage,
		login: mockLogin,
	}),
}));

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

// Mount helper with form components stubbed.
const mount = createMount(Login, {
	global: {
		stubs: {
			FormWrapper: true,
			FormField: true,
		},
	},
});

describe("login", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockErrorMessage.value = null;
	});

	describe("performLogin", () => {
		test("Logs in with the current form data", async () => {
			mockLogin.mockResolvedValue({});

			// Rendered login page under test.
			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockLogin).toHaveBeenCalledWith(wrapper.vm.formData);
		});

		test("Redirects to sample pages on success", async () => {
			mockLogin.mockResolvedValue({});

			// Rendered login page after a successful sign-in.
			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockRouter.push).toHaveBeenCalledWith({ name: "sample-pages" });
		});

		test("Redirects to the safe internal route on success", async () => {
			setRoute({ query: { redirect: "/account?tab=security" } });

			mockLogin.mockResolvedValue({});

			// Rendered login page with a safe redirect.
			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockRouter.push).toHaveBeenCalledWith("/account?tab=security");
		});

		test.each([
			["an absolute URL", "https://example.com/account"],
			["a protocol-relative URL", "//example.com/account"],
			["an array", ["/account"]],
			["a non-string value", 42],
			["a missing value", undefined],
		])("Falls back to sample pages for %s redirect values", async (_description, redirect) => {
			setRoute({ query: { redirect } });

			mockLogin.mockResolvedValue({});

			// Rendered login page with an unsafe redirect.
			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockRouter.push).toHaveBeenCalledWith({ name: "sample-pages" });
		});

		test("Does not throw or redirect when login fails", async () => {
			mockLogin.mockRejectedValue(new Error("Invalid credentials"));

			// Rendered login page after a rejected sign-in.
			const wrapper = mount();

			await expect(wrapper.vm.performLogin()).resolves.not.toThrow();

			expect(mockRouter.push).not.toHaveBeenCalled();
		});
	});
});
