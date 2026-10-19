import { useMutationWrapper } from "@/queries/use-mutation-wrapper/use-mutation-wrapper";
import { toValue } from "vue";

/**
 * Create a domain record and refresh its cached queries when the request
 * settles.
 *
 * @param  {object}  options
 *     The create settings.
 * @param  {object}  options.domain
 *     The domain's API client, endpoint, cache keys, and form value mapper.
 *
 * @returns  {object}
 *     The configured mutation and its state.
 */
export function useCreateMutation({ domain }) {
	// The shared API settings for this domain.
	const { api, endpoint, keys, prepare } = domain;

	return useMutationWrapper({
		invalidates: [keys.root],
		/**
		 * Post the submitted values to the domain endpoint after the domain's
		 * `prepare` maps them. `prepare` gets a shallow copy, so it can add,
		 * rename, or remove top-level fields without changing the form's
		 * values, but it should replace nested objects and arrays rather than
		 * edit them.
		 *
		 * @param  {object|Ref<object>}  parameters
		 *     The values submitted by the form.
		 *
		 * @returns  {Promise<object>}
		 *     The created record.
		 */
		mutation: (parameters) => api.post(endpoint, prepare({ ...toValue(parameters) })),
	});
}
