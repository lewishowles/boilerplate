import mockApi from "@unit/support/mock-api";
import mockRouter from "@unit/support/mock-router";
import { createMount } from "@unit/support/mount";
import { describe, expect, test } from "vitest";
import {{PASCAL_CASE_NAME}} from "./{{COMPONENT_NAME}}.vue";

const mount = createMount({{PASCAL_CASE_NAME}});

describe("{{COMPONENT_NAME}}", () => {
	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});
});
