import { afterEach, describe, expect, test } from "vite-plus/test";
import { createApp, defineComponent, h, reactive } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

import { provideMenu, useMenuGroup, useMenuItem } from "./use-menu";

// Empty route component used by the memory-history router.
const TestRoute = defineComponent({
	/**
	 * Renders no route content in the menu composable tests.
	 *
	 * @returns  {null}
	 *     No rendered route content.
	 */
	render() {
		return null;
	},
});

// Boilerplate routes used by the memory-history router.
const routes = [
	{ component: TestRoute, name: "home", path: "/" },
	{ component: TestRoute, name: "sample-pages", path: "/sample-pages" },
	{
		component: TestRoute,
		name: "sample-page",
		path: "/sample-pages/:samplePageId",
	},
];

// Vue application used to provide the menu context to test links.
let application;

/**
 * Mount sidebar links within one menu group.
 *
 * @param  {object[]}  links
 *     Link records to register in the menu.
 * @param  {object}  destination
 *     Route to make current before mounting the menu.
 *
 * @returns  {Promise<object>}
 *     Reactive link states and the current group state.
 */
async function mountMenu(links, destination) {
	// Memory-history router using boilerplate's named route structure.
	const router = createRouter({
		history: createMemoryHistory(),
		routes,
	});

	await router.push(destination);
	await router.isReady();

	// Reactive states exposed from the link components.
	const states = reactive({});

	// Component that registers every link supplied by the test case.
	const TestLinks = defineComponent({
		/**
		 * Registers test links and renders no content.
		 *
		 * @returns  {Function}
		 *     Empty render function for the test component.
		 */
		setup() {
			links.forEach((link) => {
				states[link.id] = useMenuItem(link.to).state;
			});

			return () => null;
		},
	});

	// Reactive state exposed by the test sidebar group.
	let groupState;

	// Component that provides one sidebar group for the test links.
	const TestGroup = defineComponent({
		/**
		 * Provides one sidebar group around the test links.
		 *
		 * @returns  {Function}
		 *     Render function for the test links.
		 */
		setup() {
			// Active state exposed by the test sidebar group.
			groupState = useMenuGroup().isActive;

			return () => h(TestLinks);
		},
	});

	// Component that provides the menu context for the test group.
	const TestMenu = defineComponent({
		/**
		 * Provides the menu context around the test group.
		 *
		 * @returns  {Function}
		 *     Render function for the test group.
		 */
		setup() {
			provideMenu();

			return () => h(TestGroup);
		},
	});

	application = createApp(TestMenu);
	application.use(router);
	application.mount(document.createElement("div"));

	return { groupState, states };
}

afterEach(() => {
	application?.unmount();
	application = null;
});

describe("use-menu", () => {
	describe("Link states", () => {
		test("Marks the flat sample-pages route as active on an exact match", async () => {
			// Sidebar link states for the exact matching route.
			const { states } = await mountMenu(
				[
					{ id: "home", to: { name: "home" } },
					{ id: "sample-pages", to: { name: "sample-pages" } },
				],
				{ name: "sample-pages" },
			);

			expect(states["sample-pages"]).toBe("active");
			expect(states.home).toBe(null);
		});

		test("Marks the nearest sidebar ancestor as active for a flat detail route", async () => {
			// Sidebar link states for the detail route.
			const { states } = await mountMenu(
				[
					{ id: "home", to: { name: "home" } },
					{ id: "sample-pages", to: { name: "sample-pages" } },
				],
				{ name: "sample-page", params: { samplePageId: "sample-123" } },
			);

			expect(states["sample-pages"]).toBe("active");
			expect(states.home).toBe(null);
		});

		test("Marks a less-specific matching link as in-section", async () => {
			// Sidebar link states with both matching paths registered.
			const { states } = await mountMenu(
				[
					{ id: "sample-pages", to: { name: "sample-pages" } },
					{
						id: "sample-page",
						to: {
							name: "sample-page",
							params: { samplePageId: "sample-123" },
						},
					},
				],
				{ name: "sample-page", params: { samplePageId: "sample-123" } },
			);

			expect(states["sample-page"]).toBe("active");
			expect(states["sample-pages"]).toBe("in-section");
		});

		test("Marks only groups containing a matching link as active", async () => {
			// Group state when the group contains the matching link.
			const { groupState: activeGroupState } = await mountMenu(
				[{ id: "sample-pages", to: { name: "sample-pages" } }],
				{ name: "sample-pages" },
			);

			expect(activeGroupState.value).toBe(true);

			application.unmount();
			application = null;

			// Group state when the group has no matching link.
			const { groupState: inactiveGroupState } = await mountMenu(
				[{ id: "home", to: { name: "home" } }],
				{ name: "sample-pages" },
			);

			expect(inactiveGroupState.value).toBe(false);
		});

		test("Skips external URLs", async () => {
			// Sidebar link state for an external URL.
			const { states } = await mountMenu([{ id: "external", to: "https://example.com" }], {
				name: "home",
			});

			expect(states.external).toBe(null);
		});
	});
});
