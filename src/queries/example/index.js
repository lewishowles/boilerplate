import { toValue } from "vue";
import { defineQueryOptions, useMutation, useQueryCache } from "@pinia/colada";
import useApi from "@/composables/api/xano/use-api";
import { useQueryWrapper } from "@/queries/use-query-wrapper/use-query-wrapper";

import { EXAMPLE_KEYS } from "./keys.js";

const { get, post } = useApi();

export function useExample(id) {
	const queryCache = useQueryCache();

	const example = useQueryWrapper({
		queryOptions: () => ({
			...exampleQueryOptions(toValue(id)),
			enabled: Boolean(toValue(id)),
		}),
	});

	const { mutateAsync: createExample } = useMutation({
		mutation: (parameters) => post("examples", parameters),
		async onSettled() {
			await queryCache.invalidateQueries({ key: EXAMPLE_KEYS.root });
		},
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
