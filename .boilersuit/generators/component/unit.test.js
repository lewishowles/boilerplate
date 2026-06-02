import { createMount } from "@unit/support/mount";
import { describe, expect, test } from "vite-plus/test";
import {{NAME | pascal}} from "./{{NAME | kebab}}.vue";

const mount = createMount({{NAME | pascal}});

describe("{{NAME | kebab}}", () => {
	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});
});
