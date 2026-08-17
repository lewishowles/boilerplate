export const {{ NAME | constant }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	list: (parameters = {}) => ["{{ NAME | kebab }}", "list", parameters],
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
