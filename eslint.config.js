import globals from "globals";
import pluginJs from "@eslint/js";
import stylistic from "./config/eslint/stylistic.js";
import vue from "./config/eslint/vue.js";

export default [
	{
		ignores: ["**/build/*", "**/dist/*", "support/"],
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
	stylistic,
];
