import { expect, test } from "@playwright/experimental-ct-vue";
import { createMount } from "#test/ct/support/mount.js";

import {{NAME | pascal}} from "./{{NAME | kebab}}.vue";

const mount{{NAME | pascal}} = createMount({{NAME | pascal}});

test.describe("{{NAME | kebab}}", () => {
	test("a component is rendered", async ({ mount, page }) => {
		await mount{{NAME | pascal}}(mount);

		await expect(page.getByTestId("{{NAME | kebab}}")).toBeVisible();
	});
});
