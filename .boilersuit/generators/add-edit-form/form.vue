<template>
	<p v-if="isInitialLoading" role="status">Loading item...</p>

	<div v-else-if="hasLoadError" role="alert">
		<p>Unable to load this item.</p>
		<button type="button" @click="retryLoad">Retry</button>
	</div>

	<p v-else-if="itemNotFound" role="status">Item not found.</p>

	<form-wrapper
		v-else-if="isReady"
		v-model="formData"
		v-bind="{ fieldTypes, initialData, recordId: itemId, rules }"
		@submit="submitForm"
	>
		<template #default>
			<!-- TODO: Add item fields. -->
		</template>

		<template #submit-button-label>
			<span v-text="isEditMode ? 'Save changes' : 'Create'" />
		</template>
	</form-wrapper>
</template>

<script setup>
import { computed, ref, toRef } from "vue";
import { useFlashMessages } from "@lewishowles/components/composables";
import { use{{ SINGULAR_NAME | pascal }}, use{{ SINGULAR_NAME | pascal }}Actions } from "@/queries/{{ NAME | kebab }}";

const props = defineProps({
	/**
	 * Identifier of the item to edit. A falsy value (unset, null, empty
	 * string, 0) opens the form in add mode; any other id loads that item
	 * and switches to edit mode.
	 */
	itemId: {
		type: [String, Number],
		default: null,
	},
});

// Access to flash messaging system.
const { sendMessage } = useFlashMessages();
// Working copy of the field values, bound to the form wrapper's model.
const formData = ref({});
// Item id as a prop ref handed reactively to the details query.
const itemId = toRef(props, "itemId");
// Edit mode is any item id the details query would actually fetch for. That
// query gates on `enabled: Boolean(unref(id))`, so matching it here keeps the
// two in step (a falsy id such as null, "", or 0 stays in add mode).
const isEditMode = computed(() => Boolean(itemId.value));
// TODO: Add field coercions, keyed by field name, for the form wrapper.
const fieldTypes = {};
// TODO: Add validation rules, keyed by field name.
const rules = {};

// The details query is self-gated with `enabled: Boolean(unref(id))`, so add
// mode (no usable id) never triggers a fetch. Its isInitialLoading is aliased
// to leave that name for the form-owned computed below.
const {
	error,
	have{{ SINGULAR_NAME | pascal }},
	isInitialLoading: queryIsInitialLoading,
	refetch,
	{{ SINGULAR_NAME | camel }},
} = use{{ SINGULAR_NAME | pascal }}(itemId);

// Create and update mutations for the item.
const { create{{ SINGULAR_NAME | pascal }}, update{{ SINGULAR_NAME | pascal }} } = use{{ SINGULAR_NAME | pascal }}Actions();

// The template shows the first of these branches that is true, in source
// order; they only gate edit mode, so add mode goes straight to isReady.
// After a failed retry the last item is kept, so hasLoadError and isReady
// can both be true and the error branch wins.

// Edit mode is waiting for the first response.
const isInitialLoading = computed(() => isEditMode.value && queryIsInitialLoading.value);
// The load settled with an error; the user can retry.
const hasLoadError = computed(() => isEditMode.value && !isInitialLoading.value && Boolean(error.value));

// The load settled with no error but returned no item.
const itemNotFound = computed(
	() => isEditMode.value && !isInitialLoading.value && !error.value && !have{{ SINGULAR_NAME | pascal }}.value,
);

// Add mode, or edit mode with an item to show.
const isReady = computed(() => !isEditMode.value || have{{ SINGULAR_NAME | pascal }}.value);

// Clean-form seed for the wrapper in edit mode.
// TODO: Map the loaded item to the shape the form fields expect.
const initialData = computed(() => {
	if (!isEditMode.value || !have{{ SINGULAR_NAME | pascal }}.value) {
		return null;
	}

	return {{ SINGULAR_NAME | camel }}.value;
});

/**
 * Refetch the item after a failed load, for the retry control.
 */
function retryLoad() {
	refetch();
}

/**
 * Route the submitted values to the create or update action and announce the
 * result.
 *
 * @param  {object}  values
 *     Field values from the form wrapper's submit event.
 */
async function submitForm(values) {
	const result = isEditMode.value
		? await update{{ SINGULAR_NAME | pascal }}({ {{ ID_NAME }}: itemId.value, ...values })
		: await create{{ SINGULAR_NAME | pascal }}(values);

	// Create a success message
	sendMessage({
		message: "{{ SINGULAR_NAME }} created successfully",
		type: "success",
	});

	await router.push({ name: "home" });
}
</script>
