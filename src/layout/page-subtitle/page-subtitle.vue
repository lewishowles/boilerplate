<template>
	<h2
		class="text-content-strong text-2xl font-bold"
		:class="{ 'mbe-4 lg:mbe-6': !$slots.introduction }"
	>
		<slot />
	</h2>

	<p v-if="$slots.introduction" class="mbe-4 lg:mbe-6">
		<slot name="introduction" />
	</p>
</template>
