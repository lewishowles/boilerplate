import { expect, test } from "@playwright/test";

// Story rendered by the {{NAME | kebab}} component tests.
const storyId = "components/{{NAME | kebab}}/{{NAME | kebab}}";

test.describe("{{NAME | kebab}}", () => {
	test("a component is rendered", async ({ mount }) => {
		// The component as rendered by its story.
		const component = await mount(storyId);

		await expect(component.getByTestId("{{NAME | kebab}}")).toBeVisible();
	});
});
