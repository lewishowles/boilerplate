import {{NAME | pascal}} from "./{{NAME | kebab}}.vue";
import { createMount } from "@cypress/support/mount";

const mount = createMount({{NAME | pascal}});

describe("{{NAME | kebab}}", () => {
	it("A component is rendered", () => {
		mount();

		cy.getByData("{{NAME | kebab}}").shouldBeVisible();
	});
});
