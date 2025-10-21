describe("{{VIEW_NAME}}", () => {
	it("A view is rendered", () => {
		cy.visit("/");

		cy.getByData("{{VIEW_NAME}}").shouldBeVisible();
	});
});
