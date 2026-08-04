import { createMount } from "@lewishowles/testing/vue";
import { afterEach, describe, expect, test } from "vite-plus/test";
import AppTitleBar from "./app-title-bar.vue";
import { useSidebar } from "@/composables/layout/use-sidebar";

const mount = createMount(AppTitleBar);
const { showSidebar } = useSidebar();

describe("app-title-bar", () => {
	afterEach(() => {
		showSidebar.value = true;
	});

	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});

	describe("Interactions", () => {
		test("Toggles the sidebar when the desktop toggle is clicked", async () => {
			const wrapper = mount();
			const toggleButton = wrapper.get("ui-button-stub");

			await toggleButton.trigger("click");

			expect(showSidebar.value).toBe(false);
		});
	});
});
