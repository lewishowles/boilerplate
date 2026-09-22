<template>
	<form-flow v-model="record" class="bg-surface border-border rounded-lg border p-6">
		<form-field type="text" name="name">Name</form-field>

		<template #submit-button-label>Save {{ SINGULAR_NAME | lower }}</template>
	</form-flow>
</template>

<script setup>
/**
 * Edits a {{ SINGULAR_NAME | kebab }} record.
 */
// The form values, shared with the page that saves them.
const record = defineModel({
	/**
	 * Provide empty initial form values.
	 *
	 * @returns  {object}
	 *     The initial form values.
	 */
	default: () => ({
		name: "",
	}),
});
</script>
