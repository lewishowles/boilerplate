import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "@lewishowles/testing/playwright";

import AppTitleBar from "./app-title-bar.vue";

const mountAppTitleBar = createMount(AppTitleBar);

test.describe("app-title-bar", () => {
	test("renders the title bar landmark", async ({ mount, page }) => {
		await mountAppTitleBar(mount);

		await expect(page.getByRole("banner")).toBeAttached();
	});
});
