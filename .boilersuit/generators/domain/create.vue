<template>
	<page-title>
		Add {{ SINGULAR_NAME | lower }}

		<template #introduction>Add a new {{ SINGULAR_NAME | lower }} record</template>
	</page-title>

	<{{ SINGULAR_NAME | kebab }}-form v-model="record" @submit="handleSubmit" />
</template>

<script setup>
/**
 * Creates a {{ SINGULAR_NAME | kebab }} record and opens its details page.
 */
import { ref } from "vue";
import { definePage } from "vue-router/experimental";
import { useFlashMessages } from "@lewishowles/components/composables";
import { use{{ SINGULAR_NAME | pascal }}Actions } from "@/queries/{{ NAME | kebab }}";
import { useRouter } from "vue-router";

// Show a success message once the record is saved.
const { sendMessage } = useFlashMessages();
// Open the new record once it has been created.
const router = useRouter();
// Save the new record.
const { create{{ SINGULAR_NAME | pascal }} } = use{{ SINGULAR_NAME | pascal }}Actions();
// Hold the values entered into the form.
const record = ref({});

/**
 * Create the record and open its details page.
 *
 * @param  {object}  parameters
 *     The values submitted by the form.
 */
async function handleSubmit(parameters) {
	// Record returned by the create action.
	const response = await create{{ SINGULAR_NAME | pascal }}(parameters);

	sendMessage({
		message: "{{ SINGULAR_NAME | pascal }} added successfully",
		type: "success",
	});

	await router.push({
		name: "{{ NAME | kebab }}-edit",
		params: { {{ ID_NAME }}: response.id },
	});
}

definePage({
	name: "{{ NAME | kebab }}-create",
	meta: { page_title: "Add {{ SINGULAR_NAME | pascal }}" },
});
</script>
