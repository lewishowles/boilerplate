import tailwind from "eslint-plugin-tailwindcss";

export default [
	...tailwind.configs["flat/recommended"],
	{
		rules: {
			"tailwindcss/no-custom-classname": ["off"],
		},
	},
];
