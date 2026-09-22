import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test, vi } from "vite-plus/test";

import {{ SINGULAR_NAME | pascal }}Form from "./{{ SINGULAR_NAME | kebab }}-form.vue";

// Reproduce the form-flow submit contract without rendering the library
// component.
const formFlowStub = {
	props: {
		modelValue: {
			/**
			 * Provide empty initial form values to the stub.
			 *
			 * @returns  {object}
			 *     The initial form values.
			 */
			default: () => ({}),
			type: Object,
		},
	},
	template:
		'<form data-test="form-flow" @submit.prevent="$emit(\'submit\', modelValue)"><slot /></form>',
};

// Mount the form with form-field and form-flow stubbed.
const mount = createMount({{ SINGULAR_NAME | pascal }}Form, {
	global: {
		stubs: {
			FormField: true,
			FormFlow: formFlowStub,
		},
	},
});

describe("{{ SINGULAR_NAME | kebab }}-form", () => {
	test("Starts with an empty name", () => {
		// Form wrapper returned by the mount helper.
		const wrapper = mount();

		expect(wrapper.vm.record).toEqual({ name: "" });
	});

	test("Forwards submit to the parent", async () => {
		// Parent submit handler.
		const submit = vi.fn().mockResolvedValue();

		// Form wrapper with the submit handler attached.
		const wrapper = mount({
			attrs: {
				onSubmit: submit,
			},
		});

		await wrapper.get("[data-test='form-flow']").trigger("submit");

		expect(submit).toHaveBeenCalledWith({ name: "" });
	});
});
