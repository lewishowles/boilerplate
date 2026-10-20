<template>
	<page-title v-if="have{{ SINGULAR_NAME | pascal }} || isInitialLoading">{{ SINGULAR_NAME | sentence }}</page-title>

	<loading-indicator v-if="isInitialLoading" v-bind="{ large: true }">
		Loading {{ SINGULAR_NAME | words }}…
	</loading-indicator>

	<{{ SINGULAR_NAME | kebab }}-form v-else-if="have{{ SINGULAR_NAME | pascal }}" v-model="record" editing @submit="handleSubmit" />

	<none-found v-else>
		<template #title>{{ SINGULAR_NAME | sentence }} not found</template>

		This {{ SINGULAR_NAME | words }} couldn't be found. Please try again.
	</none-found>
</template>

<script setup>
/**
 * Displays and updates a {{ SINGULAR_NAME | words }} record.
 */
import { useBreadcrumb } from "@/composables/router/use-breadcrumbs";
import { usePageTitle } from "@/composables/router/use-page-title";
import { use{{ SINGULAR_NAME | pascal }}, use{{ SINGULAR_NAME | pascal }}Actions } from "@/queries/{{ NAME | kebab }}";
import { useFlashMessages } from "@lewishowles/components/composables";
import { isNonEmptyObject } from "@lewishowles/helpers/object";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { definePage } from "vue-router/experimental";

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

useBreadcrumb(() => "{{ SINGULAR_NAME | sentence }}");

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
		message: "{{ SINGULAR_NAME | sentence }} saved",
		type: "success",
	});
}

definePage({
	name: "{{ NAME | kebab }}-edit",
	meta: { page_title: "{{ SINGULAR_NAME | sentence }}" },
});

usePageTitle(computed(() => {{ SINGULAR_NAME | camel }}.value?.name));
</script>
