import { createMount } from "@lewishowles/testing/vue";
import { describe, expect, test } from "vite-plus/test";
import PageTitle from "./page-title.vue";

const mount = createMount(PageTitle);

describe("page-title", () => {
	describe("Render contracts", () => {
		test("Does not render introduction content by default", () => {
			const wrapper = mount();

			expect(wrapper.find("p.text-content-muted").exists()).toBe(false);
		});

		test("Renders introduction content when the introduction slot is filled", () => {
			const wrapper = mount({
				slots: {
					introduction: "Page introduction",
				},
			});

			expect(wrapper.find("p.text-content-muted").text()).toBe("Page introduction");
		});

		test("Does not render the actions group by default", () => {
			const wrapper = mount();

			expect(wrapper.find("div.text-sm").exists()).toBe(false);
		});

		test("Renders the actions group when the actions slot is filled", () => {
			const wrapper = mount({
				slots: {
					actions: "Page actions",
				},
			});

			expect(wrapper.find("div.text-sm").text()).toBe("Page actions");
		});
	});
});
