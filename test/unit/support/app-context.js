import { PiniaColada } from "@pinia/colada";
import { createApp } from "vue";
import { createPinia } from "pinia";

/**
 * Run a composable in the same app context it expects at runtime.
 *
 * @param  {Function}  callback
 *     The composable call to run with app providers available.
 */
export function withAppContext(callback) {
	const app = createApp({});
	const pinia = createPinia();

	app.use(pinia);
	app.use(PiniaColada);

	return app.runWithContext(callback);
}
