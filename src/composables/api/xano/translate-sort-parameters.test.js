import { describe, expect, test } from "vite-plus/test";

import translateSortParameters from "./translate-sort-parameters";

describe("translate sort parameters", () => {
	test.each([
		["ascending", "asc"],
		["descending", "desc"],
	])("Converts %s to %s", (direction, sortOrder) => {
		// The parameters to test.
		const parameters = {
			page: 2,
			sort: {
				column: "name",
				direction,
			},
		};

		expect(translateSortParameters(parameters)).toEqual({
			page: 2,
			sort_by: "name",
			sort_order: sortOrder,
		});
	});

	test.each([
		["no sort", {}],
		["a null sort", { sort: null }],
		["an empty sort", { sort: {} }],
		[
			"an unrecognised direction",
			{
				sort: {
					column: "name",
					direction: "sideways",
				},
			},
		],
	])("Leaves %s without translated sorting", (_description, parameters) => {
		// Test translate our parameters.
		const translatedParameters = translateSortParameters(parameters);

		expect(translatedParameters).toEqual(parameters);
		expect(translatedParameters).not.toHaveProperty("sort_by");
		expect(translatedParameters).not.toHaveProperty("sort_order");
		expect(translatedParameters).not.toBe(parameters);
	});

	test("Does not mutate the input parameters", () => {
		// The parameters to test.
		const parameters = {
			page: 2,
			sort: {
				column: "name",
				direction: "descending",
			},
		};

		translateSortParameters(parameters);

		expect(parameters).toEqual({
			page: 2,
			sort: {
				column: "name",
				direction: "descending",
			},
		});
	});
});
