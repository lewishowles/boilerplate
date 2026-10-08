import { createDeepMount } from "@lewishowles/testing/vue";
import { describe, expect, test } from "vite-plus/test";

import PageSubtitle from "@/layout/page-subtitle/page-subtitle.vue";

// Mount the subtitle with its heading and introduction fully rendered.
const mount = createDeepMount(PageSubtitle);

describe("page-subtitle", () => {
	test("Shows the supplied heading and introduction", () => {
		const wrapper = mount({
			slots: { default: "Flight details", introduction: "Review this flight." },
		});

		expect(wrapper.get("h2").text()).toBe("Flight details");
		expect(wrapper.get("p").text()).toBe("Review this flight.");
	});
});
