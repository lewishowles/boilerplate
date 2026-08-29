import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { ref, toValue } from "vue";
import { createMount, withAppContext } from "@lewishowles/testing/vue";
import { setupConsole } from "@lewishowles/testing/vitest";

import Form from "./add-edit-{{ SINGULAR_NAME | kebab }}-form.vue";

// Hoisted stand-ins for the query barrel, wired up by the vi.mock call below so
// each test controls the form's load state and action results.
const mockCreate{{ SINGULAR_NAME | pascal }} = vi.hoisted(() => vi.fn());
const mockUpdate{{ SINGULAR_NAME | pascal }} = vi.hoisted(() => vi.fn());
const mockUse{{ SINGULAR_NAME | pascal }} = vi.hoisted(() => vi.fn());
const mockUse{{ SINGULAR_NAME | pascal }}Actions = vi.hoisted(() => vi.fn());

vi.mock("@/queries/{{ NAME | kebab }}", () => ({
	use{{ SINGULAR_NAME | pascal }}: mockUse{{ SINGULAR_NAME | pascal }},
	use{{ SINGULAR_NAME | pascal }}Actions: mockUse{{ SINGULAR_NAME | pascal }}Actions,
}));

// Mount helper with the form wrapper stubbed, so tests exercise the form's own
// mode, state, and submit logic rather than the wrapper's rendering.
const mount = createMount(Form, {
	global: {
		stubs: {
			FormWrapper: true,
		},
	},
});

// The current test's query signals, replaced in beforeEach for isolation.
let queryState;

/**
 * Build a fresh set of the query-wrapper signals the form actually reads, as
 * refs the test can drive to reach each load state.
 *
 * @return  {object}
 *     `error`, `have{{ SINGULAR_NAME | pascal }}`, `isInitialLoading`, the item ref, and a `refetch` mock.
 */
function createQueryState() {
	return {
		error: ref(null),
		have{{ SINGULAR_NAME | pascal }}: ref(false),
		isInitialLoading: ref(false),
		refetch: vi.fn(),
		{{ SINGULAR_NAME | camel }}: ref(null),
	};
}

/**
 * Mount the form inside the app context its composables expect.
 *
 * @param  {object}  options
 *     Props for the form under test, such as `itemId`.
 * @return  {object}
 *     The Vue Test Utils wrapper.
 */
function mountForm(options = {}) {
	return withAppContext(() => mount(options));
}

setupConsole();

describe("{{ SINGULAR_NAME | kebab }} form", () => {
	beforeEach(() => {
		queryState = createQueryState();
		mockCreate{{ SINGULAR_NAME | pascal }}.mockReset();
		mockUpdate{{ SINGULAR_NAME | pascal }}.mockReset();
		mockUse{{ SINGULAR_NAME | pascal }}.mockReset();
		mockUse{{ SINGULAR_NAME | pascal }}Actions.mockReset();
		mockUse{{ SINGULAR_NAME | pascal }}.mockReturnValue(queryState);
		mockUse{{ SINGULAR_NAME | pascal }}Actions.mockReturnValue({
			create{{ SINGULAR_NAME | pascal }}: mockCreate{{ SINGULAR_NAME | pascal }},
			update{{ SINGULAR_NAME | pascal }}: mockUpdate{{ SINGULAR_NAME | pascal }},
		});
	});

	describe("Mode selection", () => {
		test("Uses add mode without an item ID", () => {
			const wrapper = mountForm();
			const [{{ ID_NAME }}] = mockUse{{ SINGULAR_NAME | pascal }}.mock.calls[0];

			expect(wrapper.vm.isEditMode).toBe(false);
			expect(toValue({{ ID_NAME }})).toBe(null);
			expect(wrapper.vm.isReady).toBe(true);
		});

		test("Uses edit mode with an item ID", () => {
			const wrapper = mountForm({ itemId: "item-123" });
			const [{{ ID_NAME }}] = mockUse{{ SINGULAR_NAME | pascal }}.mock.calls[0];

			expect(wrapper.vm.isEditMode).toBe(true);
			expect(toValue({{ ID_NAME }})).toBe("item-123");
			expect(wrapper.vm.isReady).toBe(false);
		});

		test("Uses add mode with an empty item ID", () => {
			const wrapper = mountForm({ itemId: "" });

			expect(wrapper.vm.isEditMode).toBe(false);
			expect(wrapper.vm.isReady).toBe(true);
		});

		test("Uses add mode with a zero item ID", () => {
			const wrapper = mountForm({ itemId: 0 });
			const [{{ ID_NAME }}] = mockUse{{ SINGULAR_NAME | pascal }}.mock.calls[0];

			expect(wrapper.vm.isEditMode).toBe(false);
			expect(toValue({{ ID_NAME }})).toBe(0);
			expect(wrapper.vm.isReady).toBe(true);
		});
	});

	describe("Loading states", () => {
		test("Reaches the initial-loading state", () => {
			queryState.isInitialLoading.value = true;

			const wrapper = mountForm({ itemId: "item-123" });

			expect(wrapper.vm.isInitialLoading).toBe(true);
			expect(wrapper.vm.hasLoadError).toBe(false);
		});

		test("Reaches the load-error state", () => {
			queryState.error.value = new Error("Request failed");

			const wrapper = mountForm({ itemId: "item-123" });

			expect(wrapper.vm.isInitialLoading).toBe(false);
			expect(wrapper.vm.hasLoadError).toBe(true);
			expect(wrapper.vm.itemNotFound).toBe(false);
		});

		test("Retries a failed load", async () => {
			queryState.error.value = new Error("Request failed");

			const wrapper = mountForm({ itemId: "item-123" });

			await wrapper.get("[role=\"alert\"] button").trigger("click");

			expect(queryState.refetch).toHaveBeenCalledOnce();
		});

		test("Reaches the not-found state", () => {
			const wrapper = mountForm({ itemId: "item-123" });

			expect(wrapper.vm.hasLoadError).toBe(false);
			expect(wrapper.vm.itemNotFound).toBe(true);
			expect(wrapper.vm.isReady).toBe(false);
		});

		test("Reaches the ready state for a loaded item", () => {
			queryState.have{{ SINGULAR_NAME | pascal }}.value = true;
			queryState.{{ SINGULAR_NAME | camel }}.value = { id: "item-123" };

			const wrapper = mountForm({ itemId: "item-123" });

			expect(wrapper.vm.itemNotFound).toBe(false);
			expect(wrapper.vm.isReady).toBe(true);
		});
	});

	describe("Submission", () => {
		test("Creates an item in add mode", async () => {
			const values = { name: "Example" };
			mockCreate{{ SINGULAR_NAME | pascal }}.mockResolvedValue({ id: "item-123" });
			const wrapper = mountForm();

			await wrapper.vm.submitForm(values);

			expect(mockCreate{{ SINGULAR_NAME | pascal }}).toHaveBeenCalledWith(values);
			expect(mockUpdate{{ SINGULAR_NAME | pascal }}).not.toHaveBeenCalled();
		});

		test("Updates an item in edit mode", async () => {
			const values = { name: "Updated" };
			mockUpdate{{ SINGULAR_NAME | pascal }}.mockResolvedValue({ id: "item-123" });
			const wrapper = mountForm({ itemId: "item-123" });

			await wrapper.vm.submitForm(values);

			expect(mockUpdate{{ SINGULAR_NAME | pascal }}).toHaveBeenCalledWith({ {{ ID_NAME }}: "item-123", ...values });
			expect(mockCreate{{ SINGULAR_NAME | pascal }}).not.toHaveBeenCalled();
		});

		test("Emits the successful result and submitted form data", async () => {
			const values = { name: "Example" };
			const result = { id: "item-123" };
			mockCreate{{ SINGULAR_NAME | pascal }}.mockResolvedValue(result);
			const wrapper = mountForm();

			await wrapper.vm.submitForm(values);

			expect(wrapper.emitted("success")).toEqual([[{ result, formData: values }]]);
		});

		// The form must not intercept a rejected submit. Turning API errors into
		// field errors is form-wrapper.vue's job, through the parseApiFieldErrors
		// default it sets; this test only checks the form leaves that alone.
		test("Rethrows a rejected submit without touching the error", async () => {
			const error = {
				code: "ERROR_CODE_INPUT_ERROR",
				message: "Enter a name",
				payload: { param: "name" },
			};
			mockCreate{{ SINGULAR_NAME | pascal }}.mockRejectedValue(error);
			const wrapper = mountForm();

			await expect(wrapper.vm.submitForm({ name: "" })).rejects.toBe(error);
		});
	});
});
