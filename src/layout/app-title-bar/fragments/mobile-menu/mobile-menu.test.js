import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";
import MobileMenu from "./mobile-menu.vue";

const mockRoute = vi.hoisted(() => ({ fullPath: "/" }));

vi.mock("vue-router", async (importOriginal) => {
	const actual = await importOriginal();

	return {
		...actual,
		useRoute: () => mockRoute,
	};
});

const mount = createMount(MobileMenu);

describe("mobile-menu", () => {
	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});
});
