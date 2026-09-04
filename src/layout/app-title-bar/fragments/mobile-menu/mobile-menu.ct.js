import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import MobileMenu from "./mobile-menu.vue";

// Component-test mount for the mobile navigation menu.
const mountMobileMenu = createMount(MobileMenu);

test.describe("mobile-menu", () => {
	test("returns focus to the menu trigger when the dialog closes", async ({ mount, page }) => {
		await mountMobileMenu(mount);

		// Button that opens the mobile navigation menu.
		const menuTrigger = page.getByRole("button", { name: "Open navigation menu" });

		await menuTrigger.click();
		await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(menuTrigger).toBeFocused();
	});
});
