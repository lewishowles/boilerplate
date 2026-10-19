import { {{ NAME | camel }}Domain } from "./definition.js";
import { useCreateMutation } from "@/queries/use-create-mutation/use-create-mutation";
import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";
import { toValue } from "vue";

// The API client, endpoint, and cache keys for {{ SINGULAR_NAME | words }} actions.
const { api, endpoint, keys } = {{ NAME | camel }}Domain;

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
	const { mutateAsync: update{{ SINGULAR_NAME | pascal }} } = useMutationWrapper({
		/**
		 * Return cache keys affected by an updated record.
		 *
		 * @param  {object}  variables
		 *     The values passed to the update action.
		 *
		 * @returns  {object[][]}
		 *     The query keys that need refreshing.
		 */
		invalidates: (variables) => [keys.root, keys.byId(variables.{{ ID_NAME }})],
		/**
		 * Update a {{ SINGULAR_NAME | words }} record through the API.
		 *
		 * @param  {object}  options
		 *     The record ID and values to send to the API.
		 * @param  {string}  options.{{ ID_NAME }}
		 *     The ID of the {{ SINGULAR_NAME | words }} to update.
		 *
		 * @returns  {Promise<object>}
		 *     The updated {{ SINGULAR_NAME | words }} record.
		 */
		mutation: ({ {{ ID_NAME }}, ...parameters }) =>
			api.patch(`${endpoint}/${{{ ID_NAME }}}`, normaliseParametersForApi(parameters)),
	});

	return {
		create{{ SINGULAR_NAME | pascal }},
		update{{ SINGULAR_NAME | pascal }},
	};
}

/**
 * Prepare form values for the update request.
 *
 * Add update field mapping here when the API shape differs from the form
 * shape. Create requests use the domain definition's `prepare` instead.
 *
 * @param  {object}  parameters
 *     The values to send to the API.
 *
 * @returns  {object}
 *     The values to send unchanged until domain-specific mapping is added.
 */
function normaliseParametersForApi(parameters) {
	// A copy, so field mapping never changes the form's own values.
	const localParameters = { ...toValue(parameters) };

	return localParameters;
}
