import { isObject } from "@lewishowles/helpers/object";

/**
 * Convert a {{ SINGULAR_NAME | kebab }} from its API shape to the shape the UI uses.
 *
 * Add field mapping here when the two shapes differ.
 *
 * @param  {unknown}  item
 *     The raw API item.
 * @returns  {unknown}
 *     The formatted item.
 */
export function format{{ SINGULAR_NAME | pascal }}(item) {
	if (item === null || !isObject(item)) {
		return item;
	}

	return {
		...item,
	};
}
