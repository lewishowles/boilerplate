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
import { definePage } from "vue-router/experimental";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import { ref } from "vue";
import { useAuth } from "@/queries/auth";
import { useRoute, useRouter } from "vue-router";

const { errorMessage, login } = useAuth();
// Current route, including any redirect query value.
const route = useRoute();
const router = useRouter();

// Our form data.
const formData = ref({});

const rules = {
	email: [{ rule: "required", message: "Enter your email address" }],
	password: [{ rule: "required", message: "Enter your password" }],
};

/**
 * Return a safe internal redirect, or null when the value is not usable.
 *
 * @param  {unknown}  redirect
 *     The candidate redirect value from the login route query.
 * @returns {string|null}
 *     The internal redirect path, or null when the value is unsafe.
 */
function getSafeRedirect(redirect) {
	if (!isNonEmptyString(redirect) || !redirect.startsWith("/") || redirect.startsWith("//")) {
		return null;
	}

	return redirect;
}

/**
 * Attempt login for the user. If successful, redirect to the intended internal route.
 */
async function performLogin() {
	try {
		await login(formData.value);

		const redirect = getSafeRedirect(route.query?.redirect);

		await router.push(redirect ?? { name: "home" });
	} catch (error) {
		console.error("login[performLogin]: Could not log in.", error);
	}
}

definePage({
	name: "login",
	meta: { title: "Login" },
});
</script>
