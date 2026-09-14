<script setup>
/**
 * A form flow that parses this project's API errors into field errors, and
 * passes through everything the underlying component exposes.
 */
import { extendComponent } from "@lewishowles/components/utilities";
import { parseApiFieldErrors } from "@/composables/api/parse-api-field-errors";
import { useTemplateRef } from "vue";

import { FormFlow } from "@lewishowles/components";

// Initialise our extended component.
const ExtendedComponent = extendComponent(FormFlow, {
	props: { submitErrorsCallback: parseApiFieldErrors },
});

// A reference to the original component.
const inner = useTemplateRef("inner");

// Forward everything exposed from the inner FormFlow.
defineExpose(
	new Proxy(
		{},
		{
			/**
			 * Read a key from the inner component.
			 *
			 * The read happens here, on every access, rather than being captur
			 * once when the proxy is created. That is what lets a computed rea
			 * through this ref re-evaluate when the child mounts.
			 *
			 * @param  {object}  _
			 *     The proxy target, which is empty and holds nothing itself.
			 * @param  {string}  key
			 *     The key being read.
			 *
			 * @returns  {*}
			 *     The inner component's value for that key, or `undefined` bef.
			 */
			get: (_, key) => inner.value?.[key],

			/**
			 * Report whether the inner component has a key.
			 *
			 * Without this, `in` checks fall through to the empty proxy target
			 * answer false for keys the inner component really has.
			 *
			 * @param  {object}  _
			 *     The proxy target, which is empty and holds nothing itself.
			 * @param  {string}  key
			 *     The key being checked.
			 *
			 * @returns  {boolean}
			 *     Whether the inner component currently has that key.
			 */
			has: (_, key) => key in (inner.value ?? {}),
		},
	),
);
</script>

<template>
	<extended-component ref="inner" v-bind="$attrs">
		<template v-for="(_, slot) in $slots" #[slot]="slotProps">
			<slot :name="slot" v-bind="slotProps ?? {}" />
		</template>
	</extended-component>
</template>
