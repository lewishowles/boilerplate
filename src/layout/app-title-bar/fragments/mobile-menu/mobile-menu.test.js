import { createMount } from "@lewishowles/testing/vue";
import { nextTick, reactive } from "vue";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import MobileMenu from "./mobile-menu.vue";

// Mocked current route.
const mockRoute = vi.hoisted(() => ({ fullPath: "/" }));
// Reactive route used to trigger route watchers.
const reactiveRoute = reactive(mockRoute);

// Dialog stub exposing the controls used by the menu.
const modalDialogStub = {
	template: '<div><slot name="title" /><slot /></div>',
	methods: {
		close: vi.fn(),
		open: vi.fn(),
	},
};

vi.mock("vue-router", async (importOriginal) => {
	// Router module with unmocked exports retained.
	const actual = await importOriginal();

	return {
		...actual,
		/**
		 * Returns the reactive mocked route.
		 *
		 * @returns  {object}
		 *     The current mocked route.
		 */
		useRoute: () => reactiveRoute,
	};
});

// Mount helper with the dialog stub.
const mount = createMount(MobileMenu, {
	global: {
		stubs: {
			ModalDialog: modalDialogStub,
		},
	},
});

// Dialog controls asserted by the tests.
const { close, open } = modalDialogStub.methods;

describe("mobile-menu", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Interactions", () => {
		test("Opens the dialog when the mobile menu button is clicked", async () => {
			// Rendered mobile menu under test.
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
