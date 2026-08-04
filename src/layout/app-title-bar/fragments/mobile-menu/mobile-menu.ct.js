import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import MobileMenu from "./mobile-menu.vue";

const mountMobileMenu = createMount(MobileMenu);

test.describe("mobile-menu", () => {
	test("keeps the sidebar visible when the mobile menu is open", async ({ mount, page }) => {
		await mountMobileMenu(mount);

		await page.getByRole("button", { name: "Open navigation menu" }).click();

		await expect(page.getByRole("complementary")).toBeVisible();
	});
});
