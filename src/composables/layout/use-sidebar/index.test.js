import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

describe("use-sidebar", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	test("Defaults to showing the sidebar", async () => {
		// Sidebar composable export loaded for this test.
		const { useSidebar } = await import(".");
		// Sidebar visibility state from the shared composable.
		const { showSidebar } = useSidebar();

		expect(showSidebar.value).toBe(true);
	});

	test("Toggles the sidebar state", async () => {
		// Sidebar composable export loaded for this test.
		const { useSidebar } = await import(".");
		// Sidebar state and action from the shared composable.
		const { showSidebar, toggleSidebar } = useSidebar();

		toggleSidebar();

		expect(showSidebar.value).toBe(false);

		toggleSidebar();

		expect(showSidebar.value).toBe(true);
	});

	test("Shares state across separate useSidebar calls", async () => {
		// Sidebar composable export loaded for this test.
		const { useSidebar } = await import(".");
		// First composable instance used to change the shared state.
		const first = useSidebar();
		// Second composable instance used to read the shared state.
		const second = useSidebar();

		first.toggleSidebar();

		expect(second.showSidebar.value).toBe(false);
	});
});
