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

	describe("Interactions", () => {
		test("Toggles the sidebar when the desktop toggle is clicked", async () => {
			const wrapper = mount();

			// The desktop sidebar control remains the only pressed button.
			const toggleButton = wrapper
				.findAll("ui-button-stub")
				.find((button) => button.props("pressed") !== undefined);

			await toggleButton?.trigger("click");

			expect(showSidebar.value).toBe(false);
		});
	});
});
