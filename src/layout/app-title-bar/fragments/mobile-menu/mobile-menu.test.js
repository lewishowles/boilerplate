import { createMount, setRoute } from "@lewishowles/testing/vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick } from "vue";

import MobileMenu from "./mobile-menu.vue";

// Dialog stub exposing the controls used by the menu.
const modalDialogStub = {
	template: '<div><slot name="title" /><slot /></div>',
	methods: {
		close: vi.fn(),
		open: vi.fn(),
	},
};

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

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
	beforeEach(() => {
		setRoute({ fullPath: "/" });
	});

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

			setRoute({ fullPath: "/account" });

			await nextTick();

			expect(close).toHaveBeenCalledOnce();
		});
	});
});
