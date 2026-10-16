import { useListQuery } from "@/queries/use-list-query/use-list-query";
import { {{ NAME | camel }}Domain } from "./definition.js";
import { mock{{ NAME | pascal }} } from "./mock.js";

/**
 * Provide access to the {{ NAME | words }} list.
 */
export function use{{ NAME | pascal }}() {
	// The shared list state, with its items renamed for this domain below.
	const { haveItems, items, ...current{{ NAME | pascal }} } = useListQuery({
		domain: {{ NAME | camel }}Domain,
		mockData: mock{{ NAME | pascal }},
		queryOptions: { key: {{ NAME | camel }}Domain.keys.list() },
	});

	return {
		...current{{ NAME | pascal }},
		have{{ NAME | pascal }}: haveItems,
		{{ NAME | camel }}: items,
	};
}
