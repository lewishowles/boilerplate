<template>
	<div class="boxed-section">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center">
			<div class="flex flex-col gap-2">
				<h1 class="text-content-strong text-2xl font-bold">
					<slot>
						<div class="py-1">
							<loading-spinner class="text-content-strong size-6" />
						</div>
						<span class="sr-only">Loading page</span>
					</slot>
				</h1>
				<p v-if="$slots.introduction" class="text-content-muted">
					<slot name="introduction" />
				</p>
			</div>
			<div v-if="$slots.actions" class="flex items-center gap-2 text-sm lg:ms-auto">
				<slot name="actions" />
			</div>
		</div>
	</div>
</template>
