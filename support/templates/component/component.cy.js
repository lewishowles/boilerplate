import {{PASCAL_CASE_NAME}} from "./{{COMPONENT_NAME}}.vue";
import { createMount } from "@cypress/support/mount";

const mount = createMount({{PASCAL_CASE_NAME}});

describe("{{COMPONENT_NAME}}", () => {
	it("A component is rendered", () => {
		mount();

		cy.getByData("{{COMPONENT_NAME}}").shouldBeVisible();
	});
});
