import { createMount } from "@lewishowles/testing/vue";
import { nextTick, reactive } from "vue";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import MobileMenu from "./mobile-menu.vue";

const mockRoute = vi.hoisted(() => ({ fullPath: "/" }));
const reactiveRoute = reactive(mockRoute);

const modalDialogStub = {
	template: '<div><slot name="title" /><slot /></div>',
	methods: {
		close: vi.fn(),
		open: vi.fn(),
	},
};

vi.mock("vue-router", async (importOriginal) => {
	const actual = await importOriginal();

	return {
		...actual,
		useRoute: () => reactiveRoute,
	};
});

const mount = createMount(MobileMenu, {
	global: {
		stubs: {
			ModalDialog: modalDialogStub,
		},
	},
});

const { close, open } = modalDialogStub.methods;

describe("mobile-menu", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});

	describe("Interactions", () => {
		test("Opens the dialog when the mobile menu button is clicked", async () => {
			const wrapper = mount();

			await wrapper.get("ui-button-stub").trigger("click");

			expect(open).toHaveBeenCalledOnce();
		});

		test("Closes the dialog when the route changes", async () => {
			mount();

			reactiveRoute.fullPath = "/account";

			await nextTick();

			expect(close).toHaveBeenCalledOnce();
		});
	});
});
