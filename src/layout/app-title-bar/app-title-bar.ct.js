import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import AppTitleBar from "./app-title-bar.vue";

const mountAppTitleBar = createMount(AppTitleBar);

test.describe("app-title-bar", () => {
	test("renders the title bar landmark", async ({ mount, page }) => {
		await mountAppTitleBar(mount);

		await expect(page.getByRole("banner")).toBeAttached();
	});

	test("shows matching search results on desktop", async ({ mount, page }) => {
		await mountAppTitleBar(mount);
		await page.setViewportSize({ height: 720, width: 1280 });

		const searchInput = page.getByRole("combobox");

		await expect(searchInput).toBeVisible();
		await searchInput.fill("Page two");
		const searchDropdown = page.getByTestId("combo-box-dropdown");

		await expect(page.getByRole("option", { name: "Page two" })).toBeVisible();
		await expect(page.getByRole("option", { name: "Page one" })).toHaveCount(0);
		await expect(searchDropdown).toHaveClass(/p-2/);
	});

	test("opens and focuses search on mobile", async ({ mount, page }) => {
		await page.setViewportSize({ height: 844, width: 390 });
		await mountAppTitleBar(mount);

		const searchButton = page.getByRole("button", { name: "Search" });

		await expect(searchButton).toBeVisible();
		await searchButton.click();
		await expect(page.getByRole("combobox")).toBeFocused();
	});
});
