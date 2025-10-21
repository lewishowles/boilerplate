import {{PASCAL_CASE_NAME}} from "./{{VIEW_NAME}}.vue";
import { createMount } from "@cypress/support/mount";

const mount = createMount({{PASCAL_CASE_NAME}});

describe("{{VIEW_NAME}}", () => {
	it("A view is rendered", () => {
		mount();

		cy.getByData("{{VIEW_NAME}}").shouldBeVisible();
	});
});
