import { test, expect } from "@playwright/experimental-ct-vue";
import {{NAME | pascal}} from "./{{NAME | kebab}}.vue";

test.describe("{{NAME | kebab}}", () => {
	test("A component is rendered", async ({ mount }) => {
		const component = await mount({{NAME | pascal}});

		await expect(component).toBeVisible();
	});
});
