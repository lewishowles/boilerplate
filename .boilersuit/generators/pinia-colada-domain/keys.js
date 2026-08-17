export const {{ NAME | constant }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	list: () => ["{{ NAME | kebab }}", "list"],
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
