import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import MobileMenu from "./mobile-menu.vue";

const mountMobileMenu = createMount(MobileMenu);

test.describe("mobile-menu", () => {
	test("renders the mobile menu trigger", async ({ mount, page }) => {
		await mountMobileMenu(mount);

		await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeAttached();
	});
});
