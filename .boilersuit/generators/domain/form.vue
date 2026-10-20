<template>
	<form-wrapper v-model="formData" v-bind="{ fields }" class="max-w-2xl">
		<content-card>
			<content-card-section class="p-8">
				<form-fieldset>
					<template #title>Title</template>

					<template #introduction>Introduction</template>

					<form-field type="text" name="name">Name</form-field>
				</form-fieldset>
			</content-card-section>
		</content-card>

		<template #submit-button-label>
			<template v-if="editing">Save changes</template>
			<template v-else>Create {{ SINGULAR_NAME | words }}</template>
		</template>
	</form-wrapper>
</template>

<script setup>
/**
 * Collects the values for creating or updating a {{ SINGULAR_NAME | words }} record.
 */
defineProps({
	/**
	 * Whether the form edits an existing record. The submit button then says
	 * "Save changes" instead of "Create {{ SINGULAR_NAME | words }}".
	 */
	editing: {
		type: Boolean,
		default: false,
	},
});

// The form values, shared with the page that saves them. The form fills in the
// starting values from `fields`.
const formData = defineModel({ type: Object });

// The starting values and validation rules for the form's fields.
const fields = {
	name: {
		default: "",
		rules: [{ rule: "required", message: "Enter a name" }],
	},
};
</script>
