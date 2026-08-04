{{ set QUERY_KEY = NAME | constant }}
export const {{ QUERY_KEY }}_KEYS = {
	root: ["{{ NAME | kebab }}"],
	list: () => ["{{ NAME | kebab }}", "list"],
	byId: ({{ ID_NAME }}) => ["{{ NAME | kebab }}", {{ ID_NAME }}],
};
