import { {{ NAME | camel }}Domain } from "./definition.js";
import { useCreateMutation } from "@/queries/use-create-mutation/use-create-mutation";
import { useUpdateMutation } from "@/queries/use-update-mutation/use-update-mutation";

/**
 * Create and update {{ SINGULAR_NAME | words }} records.
 *
 * @returns  {object}
 *     The create and update actions.
 */
export function use{{ SINGULAR_NAME | pascal }}Actions() {
	// Action that creates a {{ SINGULAR_NAME | words }} record.
	const { mutateAsync: create{{ SINGULAR_NAME | pascal }} } = useCreateMutation({
		domain: {{ NAME | camel }}Domain,
	});

	// Action that updates a {{ SINGULAR_NAME | words }} record.
	const { mutateAsync: update{{ SINGULAR_NAME | pascal }} } = useUpdateMutation({
		domain: {{ NAME | camel }}Domain,
	});

	return {
		create{{ SINGULAR_NAME | pascal }},
		update{{ SINGULAR_NAME | pascal }},
	};
}
