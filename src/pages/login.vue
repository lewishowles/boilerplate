<template>
	<div class="flex min-h-screen flex-col items-center justify-center">
		<form-wrapper
			v-model="formData"
			v-bind="{ rules, unsavedChangesGuard: false }"
			class="w-full max-w-sm"
			@submit="performLogin"
		>
			<form-field type="email" name="email">Email</form-field>

			<form-field type="password" name="password">Password</form-field>

			<template #submit-button-label>Log in</template>

			<template #submit-errors>
				{{ errorMessage }}
			</template>
		</form-wrapper>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { definePage } from "vue-router/experimental";

import { useAuth } from "@/queries/auth";

const { errorMessage, login } = useAuth();

const router = useRouter();

// Our form data.
const formData = ref({});

const rules = {
	email: [{ rule: "required", message: "Enter your email address" }],
	password: [{ rule: "required", message: "Enter your password" }],
};

/**
 * Attempt login for the user. If successful, redirect to the homepage.
 */
async function performLogin() {
	try {
		await login(formData.value);

		await router.push({ name: "home" });
	} catch (error) {
		console.error("login[performLogin]: Could not log in.", error);
	}
}

definePage({
	name: "login",
	meta: { title: "Login" },
});
</script>
