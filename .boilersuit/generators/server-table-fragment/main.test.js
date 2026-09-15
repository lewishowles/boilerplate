import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { createMount } from "@lewishowles/testing/vue";
import { ref } from "vue";

// The mocked table composable used by each test.
const mockUse{{ NAME | pascal }}Table = vi.hoisted(() => vi.fn());

vi.mock("@/composables/{{ NAME | kebab }}", () => ({
	use{{ NAME | pascal }}Table: mockUse{{ NAME | pascal }}Table,
}));

import {{ NAME }} from "./{{ NAME | kebab }}.vue";

// The reactive table state returned by the mocked composable.
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
	search: ref(null),
	sort: ref(null),
	totalRows: ref(42),
};

// Mount the table fragment with its UI dependencies stubbed.
const mount = createMount({{ NAME }}, {
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
		mockUse{{ NAME | pascal }}Table.mockReturnValue(queryState);
	});

	test("Loads the {{ NAME | kebab }} table composable", () => {
		mount();

		expect(mockUse{{ NAME | pascal }}Table).toHaveBeenCalledOnce();
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
		mockUse{{ NAME | pascal }}Table.mockReturnValue({
			...queryState,
			error: ref(error),
			isReady: ref(false),
		});

		const wrapper = mount();

		expect(wrapper.find('[role="alert"]').text()).toBe("Unable to load {{ NAME | lower }}.");
	});
});
