import { expect, test } from "@playwright/test";

// Story rendered by the app-title-bar component tests.
const storyId = "layout/app-title-bar/app-title-bar";

// Routes given to the gallery router. The title bar links to the first two
// and offers the titled pages as search results.
const sampleRoutes = [
	{ name: "home", path: "/" },
	{ name: "sample-pages", path: "/sample-pages" },
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

test.describe("app-title-bar", () => {
	test("renders the title bar landmark", async ({ mount }) => {
		// Title bar mounted with sample routes so its links resolve.
		const component = await mount(storyId, { routes: sampleRoutes });

		await expect(component.getByRole("banner")).toBeAttached();
	});

	test("shows matching search results on desktop", async ({ mount, page }) => {
		// Title bar mounted with sample routes so search has pages to find.
		const component = await mount(storyId, { routes: sampleRoutes });

		await page.setViewportSize({ height: 720, width: 1280 });

		// Search field rendered in the title bar.
		const searchInput = component.getByRole("combobox");

		await expect(searchInput).toBeVisible();
		await searchInput.fill("Sample page two");

		// Dropdown containing matching search results.
		const searchDropdown = component.getByTestId("combo-box-dropdown");

		await expect(component.getByRole("option", { name: "Sample page two" })).toBeVisible();
		await expect(component.getByRole("option", { name: "Sample page one" })).toHaveCount(0);
		await expect(searchDropdown).toHaveClass(/p-2/);
	});

	test("opens and focuses search on mobile", async ({ mount, page }) => {
		await page.setViewportSize({ height: 844, width: 390 });

		// Title bar mounted with sample routes so search has pages to find.
		const component = await mount(storyId, { routes: sampleRoutes });
		// Button that opens the search interface.
		const searchButton = component.getByRole("button", { name: "Search" });

		await expect(searchButton).toBeVisible();
		await searchButton.click();
		await expect(component.getByRole("combobox")).toBeFocused();
	});
});
