import packageJson from "../../../../package.json" with { type: "json" };
import { computed } from "vue";
import { useColorMode, useStorage } from "@vueuse/core";

// Includes the project name so apps on the same origin don't share a
// preference.
const colourModeStorageKey = `${packageJson.name}:colour-mode`;

// Manage the override directly so useColorMode does not store the literal
// "auto"; the key must be absent when no override is set.
const colourModeOverride = useStorage(colourModeStorageKey, "auto", undefined, {
	writeDefaults: false,
});

// Adapts the override to the valid mode string useColorMode expects: an absent
// value reads as "auto", writes pass through, and null removes the key instead
// of storing "null".
const colourModeStorageRef = computed({
	/**
	 * Read the stored override as a colour mode.
	 *
	 * @returns  {string}
	 *     The stored override or automatic mode.
	 */
	get() {
		return colourModeOverride.value ?? "auto";
	},
	/**
	 * Store the selected colour mode override.
	 *
	 * @param  {string|null}  value
	 *     The override to store, or null to follow the system preference.
	 */
	set(value) {
		colourModeOverride.value = value;
	},
});

// Build one shared instance at module scope so every useColourMode() call sees
// the same mode and one listener updates the root .dark class.
const colourModeState = useColorMode({
	attribute: "class",
	disableTransition: false,
	storageRef: colourModeStorageRef,
});

// Keep the resolved mode read-only so callers use toggleColourMode() and its
// override-clearing logic instead of writing the state directly.
const colourMode = computed(() => colourModeState.value);

/**
 * Returns the shared colour mode and the action that changes it.
 *
 * @returns  {object}
 *     The shared colour mode and its toggle action.
 */
export function useColourMode() {
	/**
	 * Switches to the other colour mode. If it matches the system preference,
	 * removes the stored override.
	 */
	function toggleColourMode() {
		// The mode to store unless it already follows the system preference.
		const targetMode = colourMode.value === "dark" ? "light" : "dark";

		if (targetMode === colourModeState.system.value) {
			colourModeState.store.value = null;

			return;
		}

		colourModeState.store.value = targetMode;
	}

	return {
		colourMode,
		toggleColourMode,
	};
}
