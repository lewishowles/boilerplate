import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test } from "vite-plus/test";
import UiKeyCap from "./ui-key-cap.vue";

// Mounts ui-key-cap with the slot content each test passes in.
const mount = createMount(UiKeyCap);

describe("ui-key-cap", () => {
	describe("Render contracts", () => {
		test("Renders the default slot inside a styled kbd", () => {
			const wrapper = mount({
				slots: {
					default: "Ctrl",
				},
			});

			const keyCap = wrapper.get("kbd");

			expect(keyCap.text()).toBe("Ctrl");
			expect(keyCap.classes()).toEqual(
				expect.arrayContaining([
					"border",
					"border-border",
					"bg-surface-sunken",
					"rounded-md",
					"font-mono",
					"text-xs",
				]),
			);
		});

		test("Does not hide the key from assistive technology", () => {
			const wrapper = mount();

			expect(wrapper.get("kbd").attributes("aria-hidden")).toBeUndefined();
		});
	});
});
