import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import AppSidebar from "./app-sidebar.vue";

const mountAppSidebar = createMount(AppSidebar);

test.describe("app-sidebar", () => {
	test("renders the sidebar landmark", async ({ mount, page }) => {
		await mountAppSidebar(mount);

		await expect(page.getByRole("complementary")).toBeAttached();
	});
});
