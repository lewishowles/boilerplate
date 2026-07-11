import { toValue } from "vue";
import { defineQueryOptions } from "@pinia/colada";
import useApi from "@/composables/api/use-api";
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import { EXAMPLE_KEYS } from "./keys.js";

const { get, post } = useApi();

export function useExample(id) {
	const example = useQueryWrapper({
		queryOptions: () => ({
			...exampleQueryOptions(toValue(id)),
			enabled: Boolean(toValue(id)),
		}),
	});

	const { mutateAsync: createExample } = useMutationWrapper({
		invalidates: EXAMPLE_KEYS.root,
		mutation: (parameters) => post("examples", parameters),
	});

	return {
		...example,
		exampleData: example.data,
		createExample,
	};
}

const exampleQueryOptions = defineQueryOptions((id) => ({
	key: EXAMPLE_KEYS.byId(id),
	query: () => getExample(id),
}));

async function getExample(id) {
	return await get(`examples/${id}`);
}
