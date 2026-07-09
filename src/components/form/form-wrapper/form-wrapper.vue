<script setup>
import { extendComponent } from "@lewishowles/components/utilities";
import { parseApiFieldErrors } from "@/composables/api/parse-api-field-errors";

import { FormWrapper } from "@lewishowles/components";

const ExtendedComponent = extendComponent(FormWrapper, {
	props: { submitErrorsCallback: parseApiFieldErrors },
});
</script>

<template>
	<extended-component v-bind="$attrs">
		<template v-for="(_, slot) in $slots" #[slot]="slotProps">
			<slot :name="slot" v-bind="slotProps ?? {}" />
		</template>
	</extended-component>
</template>
