import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test } from "vite-plus/test";
import SidebarLink from "./sidebar-link.vue";

const defaultProps = { to: { path: "/" } };
const mount = createMount(SidebarLink, { props: defaultProps });

describe("sidebar-link", () => {
	describe("Initialisation", () => {
		test("A Vue component should exist", () => {
			const wrapper = mount();

			expect(wrapper.vm).toBeTypeOf("object");
		});
	});
});
