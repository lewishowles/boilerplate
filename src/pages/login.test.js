import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { ref } from "vue";
import Login from "./login.vue";

const mockLogin = vi.hoisted(() => vi.fn());
const mockRouterPush = vi.hoisted(() => vi.fn());
const mockErrorMessage = ref(null);

vi.mock("@/queries/auth", () => ({
	useAuth: () => ({
		errorMessage: mockErrorMessage,
		login: mockLogin,
	}),
}));

vi.mock("vue-router", async (importOriginal) => {
	const actual = await importOriginal();

	return {
		...actual,
		useRouter: () => ({ push: mockRouterPush }),
	};
});

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

			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockLogin).toHaveBeenCalledWith(wrapper.vm.formData);
		});

		test("Redirects to home on success", async () => {
			mockLogin.mockResolvedValue({});

			const wrapper = mount();

			await wrapper.vm.performLogin();

			expect(mockRouterPush).toHaveBeenCalledWith({ name: "home" });
		});

		test("Does not throw or redirect when login fails", async () => {
			mockLogin.mockRejectedValue(new Error("Invalid credentials"));

			const wrapper = mount();

			await expect(wrapper.vm.performLogin()).resolves.not.toThrow();
			expect(mockRouterPush).not.toHaveBeenCalled();
		});
	});
});
