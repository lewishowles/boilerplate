/**
 * Compose multiple middleware guards into a single router handler. Each guard
 * receives (to, from) and can return a route object to redirect, false to
 * cancel navigation, or undefined to pass to the next guard.
 *
 * @param  {...Function}  guards
 *     Middleware functions to run in order.
 */
export default function composeMiddleware(...guards) {
	return async (to, from) => {
		for (const guard of guards) {
			const result = await guard(to, from);

			if (result !== undefined) {
				return result;
			}
		}
	};
}
