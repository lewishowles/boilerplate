import componentLibrary from "@lewishowles/components";
import { deepMerge } from "@lewishowles/helpers/object";
import { mount } from "cypress/vue";

Cypress.Commands.add("mount", (component, options = {}) => {
	options.global = options.global || {};
	options.global.stubs = options.global.stubs || {};
	options.global.stubs["transition"] = false;
	options.global.components = options.global.components || {};
	options.global.plugins = options.global.plugins || [];

	options.global.plugins = [componentLibrary];

	return mount(component, options);
});

/**
 * Returns a function to simplify mounting components in Cypress by providing
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
 */
export function createMount(component, defaultOptions = {}) {
	/**
	 * Simplify mounting components in Cypress by providing a method to pass
	 * props without the need for a "props" key, unless we also need to specify
	 * "slots".
	 *
	 * @param  {object}  options
	 *     The options to pass to Cypress for this individual mount.
	 */
	return function (options = {}) {
		const isDirectProps = !Object.hasOwn(options, "props") && !Object.hasOwn(options, "slots");
		const providedOptions = isDirectProps ? { props: options } : options;

		cy.mount(component, deepMerge(defaultOptions, providedOptions));

		cy.mount(component, deepMerge(defaultOptions, providedOptions)).then(({ wrapper }) => {
			return cy.wrap(wrapper).as("vue");
		});
	};
}
