import { createDeepMount } from "@lewishowles/testing/vue";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vite-plus/test";

import {{ SINGULAR_NAME | pascal }}Form from "./{{ SINGULAR_NAME | kebab }}-form.vue";

// Mount the form with its real form components, so submitting runs the field rules.
const mount = createDeepMount({{ SINGULAR_NAME | pascal }}Form);

describe("{{ SINGULAR_NAME | kebab }}-form", () => {
	test("Asks for a name before submitting", async () => {
		const submit = vi.fn().mockResolvedValue();

		const wrapper = mount({
			attrs: {
				onSubmit: submit,
			},
			props: {
				modelValue: {},
			},
		});

		await wrapper.get("form").trigger("submit");
		await flushPromises();

		expect(submit).not.toHaveBeenCalled();
		expect(wrapper.text()).toContain("Enter a name");
	});

	test("Forwards the entered values to the parent", async () => {
		const submit = vi.fn().mockResolvedValue();

		const wrapper = mount({
			attrs: {
				onSubmit: submit,
			},
			props: {
				modelValue: { name: "Example" },
			},
		});

		await wrapper.get("form").trigger("submit");
		await flushPromises();

		expect(submit).toHaveBeenCalledWith({ name: "Example" });
	});
});
