import pluginVue from "eslint-plugin-vue";

export default [
	...pluginVue.configs["flat/recommended"],
	{
		rules: {
			"vue/define-macros-order": [
				"error",
				{
					order: ["defineProps", "defineEmits"],
					defineExposeLast: true,
				},
			],
			"vue/html-indent": ["error", "tab"],
			"vue/html-self-closing": [
				"error",
				{
					html: {
						void: "always",
						normal: "always",
						component: "always",
					},
					svg: "always",
					math: "always",
				},
			],
			"vue/max-attributes-per-line": [
				"error",
				{
					singleline: {
						max: 5,
					},
					multiline: {
						max: 1,
					},
				},
			],
		},
	},
];
