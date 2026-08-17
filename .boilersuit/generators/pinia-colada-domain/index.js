export { use{{ SINGULAR_NAME | pascal }}Actions } from "./actions.js";
export { format{{ NAME | pascal }}Response } from "./helpers.js";
export { { { NAME | constant } } _KEYS } from "./keys.js";

export {
	use{{ NAME | pascal }} as use{{ NAME | pascal }}List,
	{{ NAME | constant }}_QUERY_KEY as {{ NAME | constant }}_LIST_QUERY_KEY,
} from "./list.js";

export {
	use{{ SINGULAR_NAME | pascal }} as use{{ SINGULAR_NAME | pascal }}Details,
	{{ NAME | constant }}_QUERY_KEY as {{ NAME | constant }}_DETAILS_QUERY_KEY,
} from "./details.js";
