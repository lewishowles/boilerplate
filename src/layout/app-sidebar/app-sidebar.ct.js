import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import AppSidebar from "./app-sidebar.vue";

const mountAppSidebar = createMount(AppSidebar);

test.describe("app-sidebar", () => {
	test("names the primary navigation", async ({ mount, page }) => {
		await mountAppSidebar(mount);

		await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeAttached();
	});
});
