import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	// Supply a local token so protected routes render without remote login.
	await page.addInitScript(() => {
		localStorage.setItem("authToken", "e2e-test-token");
	});
});

test.describe("SPA navigation focus", () => {
	test("focuses main after an internal link and browser history navigation", async ({ page }) => {
		await page.goto("/sample-pages/one");

		// The app shell landmark receives focus after the sidebar link changes.
		const main = page.locator("#main");

		await page.getByRole("link", { exact: true, name: "Sample pages" }).click();
		await expect(page).toHaveURL(/\/sample-pages$/);
		await expect(main).toBeFocused();

		await page.goBack();
		await expect(page).toHaveURL(/\/sample-pages\/one$/);
		await expect(main).toBeFocused();

		await page.goForward();
		await expect(page).toHaveURL(/\/sample-pages$/);
		await expect(main).toBeFocused();
	});

	test("moves focus to main when the skip link is activated", async ({ page }) => {
		await page.goto("/sample-pages");

		// The first tab stop is the skip link, which targets the main landmark.
		const skipLink = page.getByRole("link", { name: "Skip to main content" });

		await page.keyboard.press("Tab");
		await expect(skipLink).toBeFocused();
		await page.keyboard.press("Enter");

		await expect(page).toHaveURL(/\/sample-pages#main$/);
		await expect(page.locator("#main")).toBeFocused();
	});

	test("focuses main after navigating from the mobile menu", async ({ page }) => {
		await page.setViewportSize({ height: 844, width: 390 });
		await page.goto("/sample-pages/one");

		// The mobile navigation is a modal dialog containing the app links.
		const menuTrigger = page.getByRole("button", { name: "Open navigation menu" });

		await menuTrigger.click();

		const mobileMenu = page.getByRole("dialog", { name: "Navigation" });

		await expect(mobileMenu).toBeVisible();
		await mobileMenu.getByRole("link", { exact: true, name: "Sample pages" }).click();

		await expect(page).toHaveURL(/\/sample-pages$/);
		await expect(page.locator("#main")).toBeFocused();
		await expect(mobileMenu).toBeHidden();
	});
});
