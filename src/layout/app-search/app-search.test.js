import { createMount, mockRouter } from "@lewishowles/testing/vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { nextTick } from "vue";

import AppSearch from "./app-search.vue";

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

// Mount helper for the search component.
const mount = createMount(AppSearch);
// The viewport width to restore after each test.
const originalInnerWidth = window.innerWidth;
// A viewport width below the large breakpoint, where the shortcut opens the
// mobile search panel instead of focusing the desktop search box.
const mobileWidth = 800;
// The mounted searches to remove after each test.
const mountedWrappers = [];

/**
 * Registers one page for each title, in the given route order, and returns the
 * titles the search shows for the query.
 *
 * @param  {string[]}  pageTitles
 *     The page titles, in route order.
 * @param  {string}  query
 *     The text typed into the search.
 *
 * @returns  {string[]}
 *     The matching page titles, in the order the search shows them.
 */
function searchPageTitles(pageTitles, query) {
	mockRouter.getRoutes.mockReturnValue(
		pageTitles.map((pageTitle, index) => ({
			meta: { page_title: pageTitle },
			name: `page-${index}`,
			path: `/page-${index}`,
		})),
	);

	// The mounted search component.
	const wrapper = mount();

	mountedWrappers.push(wrapper);

	wrapper.vm.searchQuery = query;

	return wrapper.vm.matchingSearchItems.map(({ label }) => label);
}

/**
 * Mounts page search on a small screen as if on the given platform, then
 * presses a key.
 *
 * @param  {string}  platform
 *     The browser's operating system name.
 * @param  {string}  key
 *     The key pressed by the user.
 * @param  {object}  modifiers
 *     The modifier keys held during the key press.
 *
 * @returns  {object}
 *     The mounted search and the dispatched keyboard event.
 */
async function pressSearchKey(platform, key, modifiers = {}) {
	vi.stubGlobal("navigator", { platform });

	window.innerWidth = mobileWidth;

	// The mounted search component listening for the shortcut.
	const wrapper = mount();

	mountedWrappers.push(wrapper);

	await nextTick();

	// A cancelable key press so the test can check whether search handles it.
	const event = new KeyboardEvent("keydown", {
		bubbles: true,
		cancelable: true,
		key,
		...modifiers,
	});

	window.dispatchEvent(event);

	return { event, wrapper };
}

describe("app-search", () => {
	beforeEach(() => {
		mockRouter.resolve.mockReturnValue({ meta: { requiresAuth: true } });
	});

	afterEach(() => {
		for (const wrapper of mountedWrappers.splice(0)) {
			wrapper.unmount();
		}

		window.innerWidth = originalInnerWidth;

		vi.unstubAllGlobals();
	});

	test("Shows the title with the fewest extra characters first", () => {
		expect(searchPageTitles(["Register a user", "Users"], "user")).toEqual([
			"Users",
			"Register a user",
		]);
	});

	test("Shows the title where the query starts earlier first when lengths match", () => {
		expect(searchPageTitles(["a user one", "user index"], "user")).toEqual([
			"user index",
			"a user one",
		]);
	});

	test("Keeps equally close titles in route order", () => {
		expect(searchPageTitles(["User page", "User list"], "user")).toEqual([
			"User page",
			"User list",
		]);
	});

	test("Leaves out titles that do not contain the query, ignoring case", () => {
		expect(searchPageTitles(["Dashboard", "Users"], "UsEr")).toEqual(["Users"]);
	});

	test("Opens search and prevents the default action for Ctrl+K outside macOS", async () => {
		const { event, wrapper } = await pressSearchKey("Linux", "K", { ctrlKey: true });

		await nextTick();

		expect(event.defaultPrevented).toBe(true);
		expect(wrapper.find("#app-search-mobile-panel").exists()).toBe(true);
	});

	test.each([
		{ shortcut: "Ctrl+Shift+K", modifiers: { ctrlKey: true, shiftKey: true } },
		{ shortcut: "Ctrl+Alt+K", modifiers: { altKey: true, ctrlKey: true } },
		{ shortcut: "Meta+K", modifiers: { metaKey: true } },
		{ shortcut: "K without Ctrl", modifiers: {} },
	])("Ignores $shortcut outside macOS", async ({ modifiers }) => {
		const { event, wrapper } = await pressSearchKey("Linux", "K", modifiers);

		await nextTick();

		expect(event.defaultPrevented).toBe(false);
		expect(wrapper.find("#app-search-mobile-panel").exists()).toBe(false);
	});

	test("Opens search and prevents the default action for Meta+K on macOS", async () => {
		const { event, wrapper } = await pressSearchKey("MacIntel", "K", { metaKey: true });

		await nextTick();

		expect(event.defaultPrevented).toBe(true);
		expect(wrapper.find("#app-search-mobile-panel").exists()).toBe(true);
	});

	test("Ignores Ctrl+K on macOS", async () => {
		const { event, wrapper } = await pressSearchKey("MacIntel", "K", { ctrlKey: true });

		await nextTick();

		expect(event.defaultPrevented).toBe(false);
		expect(wrapper.find("#app-search-mobile-panel").exists()).toBe(false);
	});
});
