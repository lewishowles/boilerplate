{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { ref } from "vue";

const mockUse{{ COMPOSABLE_NAME }}List = vi.hoisted(() => vi.fn());

vi.mock("@/queries/{{ NAME | kebab }}", () => ({
	use{{ COMPOSABLE_NAME }}List: mockUse{{ COMPOSABLE_NAME }}List,
}));

import {{ COMPOSABLE_NAME }} from "./{{ NAME | kebab }}.vue";

const queryState = {
	error: ref(null),
	isInitialLoading: ref(false),
	isReady: ref(true),
	lastFetched: ref(new Date("2026-01-01T00:00:00.000Z")),
	refetch: vi.fn(),
	{{ DATA_NAME }}: ref([
		{
			id: "item-123",
		},
	]),
};

const mount = createMount({{ COMPOSABLE_NAME }}, {
	global: {
		stubs: {
			DataTable: true,
			LoadingIndicator: true,
			RelativeDate: true,
			UiButton: true,
		},
	},
});

describe("{{ NAME | kebab }}", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUse{{ COMPOSABLE_NAME }}List.mockReturnValue(queryState);
	});

	test("Loads the {{ NAME | lower }} list query", () => {
		mount();

		expect(mockUse{{ COMPOSABLE_NAME }}List).toHaveBeenCalledOnce();
	});

	test("Exposes the query items to the fragment", () => {
		const wrapper = mount();

		expect(wrapper.vm.{{ DATA_NAME }}).toEqual([{ id: "item-123" }]);
	});

	test("Surfaces a list query error", () => {
		const error = new Error("Request failed");
		mockUse{{ COMPOSABLE_NAME }}List.mockReturnValue({
			...queryState,
			error: ref(error),
			isReady: ref(false),
		});

		const wrapper = mount();

		expect(wrapper.find('[role="alert"]').text()).toBe("Unable to load {{ NAME | lower }}.");
	});
});
