import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";

import useApi from "@/composables/api";

import { EXAMPLE_KEYS } from "./keys.js";

const { patch, post } = useApi();

/**
 * Provide create and update actions for example.
 */
export function useExampleActions() {
	const { mutateAsync: createExample } = useMutationWrapper({
		invalidates: [EXAMPLE_KEYS.root, EXAMPLE_KEYS.list()],
		mutation: (parameters) => post("examples", parameters),
	});

	const { mutateAsync: updateExample } = useMutationWrapper({
		invalidates: (variables) => [
			EXAMPLE_KEYS.root,
			EXAMPLE_KEYS.list(),
			EXAMPLE_KEYS.byId(variables.id),
		],
		mutation: ({ id, ...parameters }) => patch(`examples/${id}`, parameters),
	});

	return {
		createExample,
		updateExample,
	};
}

// Add delete or project-specific actions here when their API contract is known.
