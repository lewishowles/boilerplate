<template>
	<page-title v-if="have{{ SINGULAR_NAME | pascal }} || isInitialLoading">{{ SINGULAR_NAME | pascal }}</page-title>

	<loading-indicator v-if="isInitialLoading" v-bind="{ large: true }">
		Loading {{ SINGULAR_NAME | lower }}…
	</loading-indicator>

	<none-found v-else-if="!have{{ SINGULAR_NAME | pascal }}">
		<template #title>{{ SINGULAR_NAME | pascal }} not found</template>

		This {{ SINGULAR_NAME | lower }} couldn't be found. Please try again.
	</none-found>

	<{{ SINGULAR_NAME | kebab }}-form v-else v-model="record" @submit="handleSubmit" />
</template>

<script setup>
/**
 * Displays and updates a {{ SINGULAR_NAME | kebab }} record.
 */
import { computed, ref, watch } from "vue";
import { definePage } from "vue-router/experimental";
import { useFlashMessages } from "@lewishowles/components/composables";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { use{{ SINGULAR_NAME | pascal }}, use{{ SINGULAR_NAME | pascal }}Actions } from "@/queries/{{ NAME | kebab }}";
import { useBreadcrumb } from "@/composables/router/use-breadcrumbs";
import { useRoute } from "vue-router";

// Read the record ID from the URL.
const route = useRoute();
// The ID of the record being edited.
const {{ ID_NAME }} = computed(() => route.params.{{ ID_NAME }});

// Load the current record.
const { have{{ SINGULAR_NAME | pascal }}, isInitialLoading, {{ SINGULAR_NAME | camel }} } = use{{ SINGULAR_NAME | pascal }}({{ ID_NAME }});

// Save changes to the record.
const { update{{ SINGULAR_NAME | pascal }} } = use{{ SINGULAR_NAME | pascal }}Actions();
// Hold an editable copy so form changes do not mutate cached query data.
const record = ref({});
// Show a success message once the record is saved.
const { sendMessage } = useFlashMessages();

useBreadcrumb(() => "{{ SINGULAR_NAME | pascal }}");

// Copy newly loaded data into the form after the asynchronous query updates.
watch(
	{{ SINGULAR_NAME | camel }},
	(currentRecord) => {
		if (!isNonEmptyObject(currentRecord)) {
			return;
		}

		record.value = { ...currentRecord };
	},
	{ immediate: true },
);

/**
 * Update the record with the values submitted by the form.
 *
 * @param  {object}  parameters
 *     The values submitted by the form.
 */
async function handleSubmit(parameters) {
	await update{{ SINGULAR_NAME | pascal }}({
		...parameters,
		{{ ID_NAME }}: {{ ID_NAME }}.value,
	});

	sendMessage({
		message: "{{ SINGULAR_NAME | pascal }} saved",
		type: "success",
	});
}

definePage({
	name: "{{ NAME | kebab }}-edit",
	meta: { page_title: "{{ SINGULAR_NAME | pascal }}" },
});
</script>
