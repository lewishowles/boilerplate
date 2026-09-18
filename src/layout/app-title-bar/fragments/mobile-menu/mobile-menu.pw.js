import { expect, test } from "@playwright/test";

// Story rendered by the mobile-menu component tests.
const storyId = "layout/app-title-bar/fragments/mobile-menu/mobile-menu";

// Routes given to the gallery router, so the sidebar inside the menu has
// links to show.
const sampleRoutes = [
	{ name: "home", path: "/" },
	{ name: "sample-pages", path: "/sample-pages" },
];

test.describe("mobile-menu", () => {
	test("returns focus to the menu trigger when the dialog closes", async ({ mount, page }) => {
		await page.setViewportSize({ height: 844, width: 390 });

		// Mobile menu mounted at a phone viewport so the trigger is visible.
		const component = await mount(storyId, { routes: sampleRoutes });
		// Button that opens the mobile navigation menu.
		const menuTrigger = component.getByRole("button", { name: "Open navigation menu" });

		await menuTrigger.click();
		await expect(component.getByRole("dialog", { name: "Navigation" })).toBeVisible();

		await page.keyboard.press("Escape");

		await expect(menuTrigger).toBeFocused();
	});
});
