import { createMount } from "@lewishowles/testing/vue";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ref } from "vue";

import AppTitleBar from "./app-title-bar.vue";
import { useSidebar } from "@/composables/layout/use-sidebar";

// Mocked current colour mode.
const mockColourMode = ref("light");
// Mocked colour-mode toggle action.
const mockToggleColourMode = vi.fn();

vi.mock("@/composables/layout/use-colour-mode", () => ({
	/**
	 * Returns the mocked colour-mode state.
	 *
	 * @returns  {object}
	 *     The mocked colour-mode interface.
	 */
	useColourMode: () => ({
		colourMode: mockColourMode,
		toggleColourMode: mockToggleColourMode,
	}),
}));

// Mount helper for the title bar.
const mount = createMount(AppTitleBar);
// Shared sidebar visibility state.
const { showSidebar } = useSidebar();

describe("app-title-bar", () => {
	describe("Initialisation", () => {
		test("Shows the light-mode icon", () => {
			// Rendered title bar under test.
			const wrapper = mount();
			// Colour-mode control in the rendered title bar.
			const colourModeButton = findColourModeButton(wrapper);

			expect(colourModeButton.props("iconStart")).toBe("icon-sun");
		});

		test("Shows the dark-mode icon", () => {
			mockColourMode.value = "dark";
			// Rendered title bar in dark mode.
			const wrapper = mount();
			// Colour-mode control in the rendered title bar.
			const colourModeButton = findColourModeButton(wrapper);

			expect(colourModeButton.props("iconStart")).toBe("icon-moon");
		});
	});

	afterEach(() => {
		showSidebar.value = true;
		mockColourMode.value = "light";
		mockToggleColourMode.mockReset();
	});

	describe("Interactions", () => {
		test("Toggles the sidebar when the desktop toggle is clicked", async () => {
			// Rendered title bar under test.
			const wrapper = mount();

			// The desktop sidebar control remains the only pressed button.
			const toggleButton = wrapper.find("ui-button-stub[pressed]");

			await toggleButton.trigger("click");

			expect(showSidebar.value).toBe(false);
		});

		test("Toggles colour mode when the button is clicked", async () => {
			// Rendered title bar under test.
			const wrapper = mount();
			// Colour-mode control in the rendered title bar.
			const colourModeButton = findColourModeButton(wrapper);

			await colourModeButton.trigger("click");

			expect(mockToggleColourMode).toHaveBeenCalledOnce();
		});
	});
});

/**
 * Finds the title-bar button that toggles colour mode, identified by its
 * resolved-mode icon.
 *
 * @param  {object}  wrapper
 *     The mounted app-title-bar wrapper.
 *
 * @returns  {object}
 *     The colour-mode button wrapper.
 */
function findColourModeButton(wrapper) {
	return wrapper
		.findAllComponents("ui-button-stub")
		.find((button) => ["icon-moon", "icon-sun"].includes(button.props("iconStart")));
}
