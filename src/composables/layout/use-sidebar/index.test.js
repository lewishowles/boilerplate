import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

describe("use-sidebar", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	test("Defaults to showing the sidebar", async () => {
		const { useSidebar } = await import(".");
		const { showSidebar } = useSidebar();

		expect(showSidebar.value).toBe(true);
	});

	test("Toggles the sidebar state", async () => {
		const { useSidebar } = await import(".");
		const { showSidebar, toggleSidebar } = useSidebar();

		toggleSidebar();

		expect(showSidebar.value).toBe(false);

		toggleSidebar();

		expect(showSidebar.value).toBe(true);
	});

	test("Shares state across separate useSidebar calls", async () => {
		const { useSidebar } = await import(".");
		const first = useSidebar();
		const second = useSidebar();

		first.toggleSidebar();

		expect(second.showSidebar.value).toBe(false);
	});
});
