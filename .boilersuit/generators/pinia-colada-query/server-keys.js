{{ set QUERY_KEY = NAME | constant }}
export const {{ QUERY_KEY }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	list: (parameters = {}) => ["{{ NAME | kebab }}", "list", parameters],
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
