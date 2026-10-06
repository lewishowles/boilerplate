import { createMount, mockRouter } from "@lewishowles/testing/vue";
import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

import AppSearch from "./app-search.vue";

vi.mock("vue-router", async (importOriginal) => ({
	...(await importOriginal()),
	...(await import("@lewishowles/testing/vue")).mockRouterModule,
}));

// Mount helper for the search component.
const mount = createMount(AppSearch);

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

	wrapper.vm.searchQuery = query;

	return wrapper.vm.matchingSearchItems.map(({ label }) => label);
}

describe("app-search", () => {
	beforeEach(() => {
		mockRouter.resolve.mockReturnValue({ meta: { requiresAuth: true } });
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
});
