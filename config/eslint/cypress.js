import pluginCypress from "eslint-plugin-cypress/flat";

export default {
	// We add the files config because the Cypress plugin seems to reach into
	// regular JS files by default and causes some issues. This originally
	// manifested as a complaint about import.meta in vite.config.js.
	files: [
		"**/*.cy.js",
		"test/cypress/support/*.js",
	],
	...pluginCypress.configs.recommended,
};
