import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import AppTitleBar from "./app-title-bar.vue";

// Routes used to verify search without reading application page files.
const sampleRoutes = [
	{ name: "home", path: "/" },
	{
		meta: { page_title: "Sample page one", requiresAuth: true },
		name: "sample-page-one",
		path: "/sample-page-one",
	},
	{
		meta: { page_title: "Sample page two", requiresAuth: true },
		name: "sample-page-two",
		path: "/sample-page-two",
	},
];

// Component-test mount configured with sample routes.
const mountAppTitleBar = createMount(AppTitleBar, { hooksConfig: { routes: sampleRoutes } });

test.describe("app-title-bar", () => {
	test("renders the title bar landmark", async ({ mount, page }) => {
		await mountAppTitleBar(mount);

		await expect(page.getByRole("banner")).toBeAttached();
	});

	test("shows matching search results on desktop", async ({ mount, page }) => {
		await mountAppTitleBar(mount);
		await page.setViewportSize({ height: 720, width: 1280 });

		// Search field rendered in the title bar.
		const searchInput = page.getByRole("combobox");

		await expect(searchInput).toBeVisible();
		await searchInput.fill("Sample page two");
		// Dropdown containing matching search results.
		const searchDropdown = page.getByTestId("combo-box-dropdown");

		await expect(page.getByRole("option", { name: "Sample page two" })).toBeVisible();
		await expect(page.getByRole("option", { name: "Sample page one" })).toHaveCount(0);
		await expect(searchDropdown).toHaveClass(/p-2/);
	});

	test("opens and focuses search on mobile", async ({ mount, page }) => {
		await page.setViewportSize({ height: 844, width: 390 });
		await mountAppTitleBar(mount);

		// Button that opens the search interface.
		const searchButton = page.getByRole("button", { name: "Search" });

		await expect(searchButton).toBeVisible();
		await searchButton.click();
		await expect(page.getByRole("combobox")).toBeFocused();
	});
});
