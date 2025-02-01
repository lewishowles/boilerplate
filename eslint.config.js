import cypress from "./config/eslint/cypress.js";
import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "./config/eslint/stylistic.js";
// import tailwind from "./config/eslint/tailwind.js";
import vue from "./config/eslint/vue.js";

export default [
	{
		ignores: ["**/dist/*", "support/"],
	},
	{
		files: ["**/*.{js,vue}"],
	},
	{
		languageOptions: {
			globals: globals.browser,
		},
	},
	pluginJs.configs.recommended,
	...vue,
	// ...tailwind,
	cypress,
	stylistic,
];
