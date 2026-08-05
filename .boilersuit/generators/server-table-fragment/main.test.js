{{ set COMPOSABLE_NAME = NAME | pascal }}
{{ set DATA_NAME = NAME | camel }}
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { ref } from "vue";

const mockUse{{ COMPOSABLE_NAME }}Table = vi.hoisted(() => vi.fn());

vi.mock("@/composables/{{ NAME | kebab }}", () => ({
	use{{ COMPOSABLE_NAME }}Table: mockUse{{ COMPOSABLE_NAME }}Table,
}));

import {{ COMPOSABLE_NAME }} from "./{{ NAME | kebab }}.vue";

const queryState = {
	error: ref(null),
	isInitialLoading: ref(false),
	isReady: ref(true),
	isRefreshing: ref(false),
	items: ref([
		{
			id: "item-123",
		},
	]),
	lastFetched: ref(new Date("2026-01-01T00:00:00.000Z")),
	page: ref(1),
	refetch: vi.fn(),
	search: ref(""),
	sort: ref(null),
	totalRows: ref(42),
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
		mockUse{{ COMPOSABLE_NAME }}Table.mockReturnValue(queryState);
	});

	test("Loads the {{ NAME | kebab }} table composable", () => {
		mount();

		expect(mockUse{{ COMPOSABLE_NAME }}Table).toHaveBeenCalledOnce();
	});

	test("Exposes table rows and the server total", () => {
		const wrapper = mount();

		expect(wrapper.vm.items).toEqual([{ id: "item-123" }]);
		expect(wrapper.vm.totalRows).toBe(42);
		expect(wrapper.vm.tableState).toEqual({
			filters: { search: "" },
			itemsPerPage: 10,
			page: 1,
			sort: null,
		});
	});

	test("Surfaces a table query error", () => {
		const error = new Error("Request failed");
		mockUse{{ COMPOSABLE_NAME }}Table.mockReturnValue({
			...queryState,
			error: ref(error),
			isReady: ref(false),
		});

		const wrapper = mount();

		expect(wrapper.find('[role="alert"]').text()).toBe("Unable to load {{ NAME | lower }}.");
	});
});
