import { useMutation, useQueryCache } from "@pinia/colada";
import { isFunction } from "@lewishowles/helpers/general";
import { toValue } from "vue";

/**
 * @typedef  {Array<string|number|object>}  QueryKey
 *     A Pinia Colada query key, such as `["examples"]` or `["examples", id]`.
 * @typedef  {(variables: object) => QueryKey|QueryKey[]}  QueryKeyGetter
 *     Resolve mutation variables into one or more query keys.
 * @typedef  {QueryKey|QueryKey[]|QueryKeyGetter}  MutationQueryKeys
 *     One or more query keys to invalidate after a mutation settles.
 */

/**
 * Simplify Pinia Colada mutations by handling common cache invalidation.
 *
 * @param  {object}  options
 *     The mutation wrapper options.
 * @param  {MutationQueryKeys}  [options.invalidates]
 *     Query keys or a getter returning query keys to invalidate.
 *
 * @returns  {object}
 *     The configured Pinia Colada mutation.
 * @example
 * useMutationWrapper({
 *     invalidates: EXAMPLE_KEYS.root,
 *     mutation: (parameters) => post("examples", parameters),
 * });
 *
 * @example
 * useMutationWrapper({
 *     invalidates: [EXAMPLE_KEYS.root, EXAMPLE_KEYS.byId(id)],
 *     mutation: (parameters) => patch(`examples/${id}`, parameters),
 * });
 *
 * @example
 * useMutationWrapper({
 *     invalidates: ({ id }) => [EXAMPLE_KEYS.root, EXAMPLE_KEYS.byId(id)],
 *     mutation: ({ id, ...fields }) => patch(`examples/${id}`, fields),
 * });
 */
// oxlint-disable-next-line comments/function-documentation -- lint-config 0.4.0 requires a @param path of [options.invalidates=[]] for the array default; the JSDoc parser cannot register that name so no tag matches it. Recorded as a task discovery.
export function useMutationWrapper({ invalidates = [], ...mutationOptions }) {
	// Pinia Colada cache used to invalidate affected queries.
	const queryCache = useQueryCache();

	return useMutation({
		...mutationOptions,

		/**
		 * Run the caller callback, then invalidate affected queries.
		 *
		 * @param  {object}  data
		 *     The mutation result data.
		 * @param  {object}  error
		 *     The mutation error, when one occurred.
		 * @param  {object}  variables
		 *     The variables passed to the mutation.
		 * @param  {object}  context
		 *     The mutation context.
		 */
		async onSettled(data, error, variables, context) {
			if (mutationOptions.onSettled) {
				await mutationOptions.onSettled(data, error, variables, context);
			}

			await invalidateQueries(queryCache, invalidates, variables);
		},
	});
}

/**
 * Invalidate each query described by the provided invalidation options.
 *
 * @param  {object}  queryCache
 *     The Pinia Colada query cache.
 * @param  {MutationQueryKeys}  invalidates
 *     Query keys or a getter returning query keys to invalidate.
 * @param  {object}  variables
 *     The variables passed to the mutation.
 */
async function invalidateQueries(queryCache, invalidates, variables) {
	// Query keys resolved from the invalidation setting.
	const invalidationKeys = normaliseQueryKeys(resolveInvalidation(invalidates, variables));

	await Promise.all(invalidationKeys.map((key) => queryCache.invalidateQueries({ key })));
}

/**
 * Resolve an invalidation option or getter.
 *
 * @param  {MutationQueryKeys}  invalidation
 *     The invalidation option to resolve.
 * @param  {object}  variables
 *     The variables passed to the mutation.
 *
 * @returns  {QueryKey|QueryKey[]}
 */
function resolveInvalidation(invalidation, variables) {
	if (isFunction(invalidation)) {
		return invalidation(variables);
	}

	return toValue(invalidation);
}

/**
 * Normalise one or more query keys into an array.
 *
 * @param  {QueryKey|QueryKey[]}  invalidationKeys
 *     The key or keys to normalise.
 *
 * @returns  {QueryKey[]}
 */
function normaliseQueryKeys(invalidationKeys) {
	if (isArrayOfQueryKeys(invalidationKeys)) {
		return invalidationKeys;
	}

	return [invalidationKeys];
}

/**
 * Determine whether the value is a list of Pinia Colada query keys.
 *
 * @param  {unknown}  value
 *     The value to check.
 *
 * @returns  {boolean}
 *     Whether the value contains only query keys.
 */
function isArrayOfQueryKeys(value) {
	return Array.isArray(value) && value.every((entry) => Array.isArray(entry));
}
