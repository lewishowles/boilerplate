import { deepMerge } from "@lewishowles/helpers/object";
import { mount, shallowMount } from "@vue/test-utils";

/**
 * Returns a function to simplify mounting components in Vitest by providing
 * the ability to mount a component with props without having to specify the
 * "props" key, unless "slots" are also required.
 *
 * Any default options passed to this function are merged with any provided
 * options when mounting a component.
 *
 * @param  {object}  component
 *     The component to mount.
 * @param  {object}  defaultOptions
 *     Default options to pass to each subsequent mount call.
 * @param  {boolean}  configuration.shallow
 *     Whether to perform a shallow mount, as opposed to a full mount. This
 *     generally improves performance.
 */
export function createMount(component, defaultOptions = {}, { shallow = true } = {}) {
	/**
	 * Simplify mounting components in Vitest by providing a method to pass
	 * props without the need for a "props" key, unless we also need to specify
	 * "slots".
	 *
	 * @param  {object}  options
	 *     The options to pass to Vitest for this individual mount.
	 */
	return function (options = {}) {
		const isDirectProps = !Object.hasOwn(options, "props") && !Object.hasOwn(options, "slots") && !Object.hasOwn(options, "global");
		const providedOptions = isDirectProps ? { props: options } : options;

		const mountFunction = shallow ? shallowMount : mount;

		return mountFunction(component, deepMerge(defaultOptions, providedOptions));
	};
};
