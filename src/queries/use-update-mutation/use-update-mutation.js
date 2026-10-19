import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";
import { toValue } from "vue";

/**
 * Update a domain record and refresh its cached queries when the request
 * settles.
 *
 * @param  {object}  options
 *     The update settings.
 * @param  {object}  options.domain
 *     The domain's API client, endpoint, ID field, cache keys, and form value
 *     mapper.
 *
 * @returns  {object}
 *     The configured mutation and its state.
 */
export function useUpdateMutation({ domain }) {
	// The shared API settings for this domain.
	const { api, endpoint, idName, keys, prepare } = domain;

	return useMutationWrapper({
		/**
		 * Refresh the domain list and updated record after the request settles.
		 *
		 * @param  {object}  variables
		 *     The submitted record ID and form values.
		 *
		 * @returns  {object[][]}
		 *     The query keys that need refreshing.
		 */
		invalidates: (variables) => [keys.root, keys.byId(toValue(variables)[idName])],
		/**
		 * Patch a record with prepared values, leaving the ID out of the body.
		 * `prepare` receives a shallow copy, so it can change top-level fields
		 * without changing the submitted values. It should replace nested
		 * objects and arrays rather than edit them.
		 *
		 * @param  {object|Ref<object>}  variables
		 *     The submitted record ID and form values.
		 *
		 * @returns  {Promise<object>}
		 *     The updated record.
		 */
		mutation: (variables) => {
			// The record ID and a shallow copy of the fields sent in the
			// request body.
			const { [idName]: id, ...parameters } = toValue(variables);

			return api.patch(`${endpoint}/${id}`, prepare(parameters));
		},
	});
}
